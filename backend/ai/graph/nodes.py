import json
import os
import sys

from dotenv import load_dotenv
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from langchain_deepseek import ChatDeepSeek

from .state import GraphState
from .response_formatter import (
    build_final_response,
)

from ..rag.deepseek import (
    ask_question,
    get_mcp_instructions,
)

from ..tool_call.runner import (
    run_tool_call,
    generate_tool_response,
)

from ..tool_call.access_control import (
    get_employee_role,
)


load_dotenv()


# ============================================================
# RAG NODE
# ============================================================

def rag_node(
    state: GraphState,
) -> GraphState:

    question = state["user_query"]

    try:

        result = ask_question(
            question
        )

        if hasattr(
            result,
            "model_dump",
        ):
            result = result.model_dump()

        return {
            **state,
            "rag_result": result,
        }

    except Exception as e:

        return {
            **state,
            "rag_result": {
                "status": "error",
                "message": str(e),
            },
            "error": str(e),
        }


# ============================================================
# DATABASE NODE
# ============================================================

def db_node(
    state: GraphState,
) -> GraphState:

    question = state["user_query"]

    employee_id = state.get(
        "employee_id"
    )

    try:

        if not employee_id:

            raise ValueError(
                "Authenticated employee ID is missing."
            )

        result = run_tool_call(
            question,
            employee_id=employee_id,
            hitl_approved=state.get(
                "hitl_approved",
                False,
            ),
            hitl_id=state.get(
                "hitl_id"
            ),
            approved_by=state.get(
                "approved_by"
            ),
        )

        return {
            **state,
            "db_result": result,
        }

    except Exception as e:

        return {
            **state,
            "db_result": {
                "status": "error",
                "message": str(e),
            },
            "error": str(e),
        }


# ============================================================
# MCP HELPERS
# ============================================================

def _mcp_result_to_dict(
    result,
) -> dict:

    if hasattr(
        result,
        "model_dump",
    ):

        data = result.model_dump()

        if isinstance(
            data,
            dict,
        ):
            return data

    if isinstance(
        result,
        dict,
    ):
        return result

    return {
        "result": str(result),
    }


def _mcp_result_is_error(
    result,
) -> bool:

    if getattr(
        result,
        "isError",
        False,
    ):
        return True

    if hasattr(
        result,
        "model_dump",
    ):

        data = result.model_dump()

        if isinstance(
            data,
            dict,
        ):

            if data.get("isError") is True:
                return True

            if data.get("is_error") is True:
                return True

            if data.get("status") in {
                "error",
                "failed",
            }:
                return True

    if isinstance(
        result,
        dict,
    ):

        if result.get("isError") is True:
            return True

        if result.get("is_error") is True:
            return True

        if result.get("status") in {
            "error",
            "failed",
        }:
            return True

    return False


# ============================================================
# MCP NODE
# ============================================================

async def mcp_node(
    state: GraphState,
) -> GraphState:

    question = state["user_query"]

    employee_id = state.get(
        "employee_id"
    )

    try:

        # ----------------------------------------------------
        # 1. Validate employee
        # ----------------------------------------------------

        if not employee_id:

            raise ValueError(
                "Authenticated employee ID is required "
                "for MCP operations."
            )

        hitl_approved = state.get(
            "hitl_approved",
            False,
        )

        hitl_id = state.get(
            "hitl_id"
        )

        approved_by = state.get(
            "approved_by"
        )

        # ----------------------------------------------------
        # 2. Get employee role
        # ----------------------------------------------------

        role = get_employee_role(
            employee_id
        )

        if role is None:

            raise PermissionError(
                "Employee role could not be determined."
            )

        # ----------------------------------------------------
        # 3. Retrieve MCP instructions
        # ----------------------------------------------------

        instructions = get_mcp_instructions(
            question,
            top_k=1,
        )

        if not instructions:

            return {
                **state,
                "mcp_result": {
                    "status": "error",
                    "message": (
                        "No relevant MCP instruction "
                        "was found for this request."
                    ),
                },
                "error": (
                    "No relevant MCP instruction "
                    "was found."
                ),
            }

        # ----------------------------------------------------
        # 4. MCP environment
        # ----------------------------------------------------

        mcp_env = os.environ.copy()

        mcp_env[
            "MCP_EMPLOYEE_ID"
        ] = employee_id

        mcp_env[
            "MCP_HITL_APPROVED"
        ] = str(
            hitl_approved
        ).lower()

        if hitl_id:

            mcp_env[
                "MCP_HITL_ID"
            ] = hitl_id

        if approved_by:

            mcp_env[
                "MCP_APPROVED_BY"
            ] = approved_by

        server_params = StdioServerParameters(
            command=sys.executable,
            args=[
                "-m",
                "backend.ai.mcp.server",
            ],
            env=mcp_env,
        )

        # ----------------------------------------------------
        # 5. Start MCP server
        # ----------------------------------------------------

        async with stdio_client(
            server_params
        ) as (
            read,
            write,
        ):

            async with ClientSession(
                read,
                write,
            ) as session:

                await session.initialize()

                # ------------------------------------------------
                # 6. Discover tools
                # ------------------------------------------------

                tools_result = (
                    await session.list_tools()
                )

                tools = tools_result.tools

                if not tools:

                    raise RuntimeError(
                        "MCP server started, but no tools "
                        "were discovered."
                    )

                # ------------------------------------------------
                # 7. Tool descriptions
                # ------------------------------------------------

                tool_descriptions = []

                for tool in tools:

                    tool_descriptions.append(
                        {
                            "name": tool.name,
                            "description": (
                                tool.description
                                or ""
                            ),
                            "input_schema": (
                                tool.input_schema
                            ),
                        }
                    )

                # ------------------------------------------------
                # 8. DeepSeek tool selection
                # ------------------------------------------------

                api_key = os.getenv(
                    "DEEPSEEK_API_KEY"
                )

                if not api_key:

                    raise ValueError(
                        "DEEPSEEK_API_KEY is not set."
                    )

                llm = ChatDeepSeek(
                    model="deepseek-chat",
                    api_key=api_key,
                )

                prompt = f"""
You are an enterprise IT assistant.

The user wants to perform a Jira operation.

The following instruction was retrieved from
the MCP instruction knowledge base.

IMPORTANT:
The instruction is guidance for selecting the
correct operation.

Actual authorization is enforced separately by
the MCP server.

RETRIEVED MCP INSTRUCTION:
-------------------------
{instructions}
-------------------------

REQUESTER INFORMATION:
-------------------------
Employee ID: {employee_id}
Role: {role}
-------------------------

AVAILABLE MCP TOOLS:
-------------------------
{json.dumps(
    tool_descriptions,
    indent=2,
)}
-------------------------

USER REQUEST:
-------------------------
{question}
-------------------------

Return ONLY valid JSON:

{{
    "tool_name": "selected_tool_name",
    "arguments": {{
        "argument_name": "argument_value"
    }}
}}

Rules:

- Select exactly one available MCP tool.
- Follow the retrieved MCP instruction.
- Use only arguments defined by the selected tool.
- Do not invent tool names.
- Do not invent required information.
- Do not invent IDs.
- Do not add unnecessary arguments.
- If required information is missing, do not invent it.
"""

                response = await llm.ainvoke(
                    prompt
                )

                content = response.content

                if isinstance(
                    content,
                    list,
                ):

                    content = "".join(
                        item.get(
                            "text",
                            "",
                        )
                        if isinstance(
                            item,
                            dict,
                        )
                        else str(item)
                        for item in content
                    )

                # ------------------------------------------------
                # 9. Parse decision
                # ------------------------------------------------

                try:

                    decision = json.loads(
                        content
                    )

                except json.JSONDecodeError as e:

                    raise ValueError(
                        "DeepSeek returned invalid "
                        "JSON for MCP tool selection."
                    ) from e

                tool_name = decision.get(
                    "tool_name"
                )

                arguments = decision.get(
                    "arguments",
                    {},
                )

                if not tool_name:

                    raise ValueError(
                        "LLM did not return a tool_name."
                    )

                if not isinstance(
                    arguments,
                    dict,
                ):

                    raise ValueError(
                        "MCP arguments must be an object."
                    )

                # ------------------------------------------------
                # 10. Validate tool
                # ------------------------------------------------

                available_tool_names = {
                    tool.name
                    for tool in tools
                }

                if (
                    tool_name
                    not in available_tool_names
                ):

                    raise ValueError(
                        f"Unknown MCP tool selected: "
                        f"{tool_name}"
                    )

                # ------------------------------------------------
                # 11. Execute MCP tool
                # ------------------------------------------------

                result = await session.call_tool(
                    tool_name,
                    arguments,
                )

                result_data = _mcp_result_to_dict(
                    result
                )

                # ------------------------------------------------
                # 12. Detect failure
                # ------------------------------------------------

                if _mcp_result_is_error(
                    result
                ):

                    return {
                        **state,
                        "mcp_result": {
                            "status": "error",
                            "tool": tool_name,
                            "arguments": arguments,
                            "result": result_data,
                        },
                        "error": (
                            "MCP tool execution failed."
                        ),
                    }

                # ------------------------------------------------
                # 13. Successful result
                # ------------------------------------------------

                return {
                    **state,
                    "mcp_result": {
                        "status": "success",
                        "tool": tool_name,
                        "arguments": arguments,
                        "result": result_data,
                    },
                }

    except Exception as e:

        import traceback

        print(
            "\n========== MCP NODE ERROR ==========",
            file=sys.stderr,
        )

        traceback.print_exc()

        print(
            "====================================\n",
            file=sys.stderr,
        )

        return {
            **state,
            "mcp_result": {
                "status": "error",
                "message": str(e),
                "error_type": type(e).__name__,
            },
            "error": str(e),
        }


# ============================================================
# FINAL RESPONSE NODE
# ============================================================

def final_response_node(
    state: GraphState,
) -> GraphState:

    route = state.get(
        "route"
    )

    if route == "rag":

        result = state.get(
            "rag_result"
        )

    elif route == "db":

        result = state.get(
            "db_result"
        )

    elif route == "mcp":

        result = state.get(
            "mcp_result"
        )

    else:

        result = {
            "status": "error",
            "message": "Unknown route.",
        }

    # --------------------------------------------------------
    # DB / MCP response LLM
    # --------------------------------------------------------

    response_message = None

    if route in {
        "db",
        "mcp",
    }:

        response_message = generate_tool_response(
            question=state["user_query"],
            tool_results=result,
        )

    # --------------------------------------------------------
    # Build normalized response
    # --------------------------------------------------------

    final_response = build_final_response(
        route=route,
        result=result,
        message_override=response_message,
    )

    return {
        **state,
        "final_response": final_response,
    }