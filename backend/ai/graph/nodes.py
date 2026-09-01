import json
import os
import sys

from dotenv import load_dotenv
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

from .state import GraphState

from ..rag.rag import ask_question
from ..tool_call.runner import run_tool_call


load_dotenv()


# ============================================================
# RAG NODE
# ============================================================

def rag_node(state: GraphState) -> GraphState:

    question = state["user_query"]

    try:
        result = ask_question(question)

        if hasattr(result, "model_dump"):
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

def db_node(state: GraphState) -> GraphState:

    question = state["user_query"]

    try:

        result = run_tool_call(question)

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
# MCP NODE
# ============================================================

async def mcp_node(state: GraphState) -> GraphState:

    question = state["user_query"]

    server_params = StdioServerParameters(
        command=sys.executable,
        args=["-m", "ai.mcp.server"],
        env=os.environ.copy(),
    )

    try:

        async with stdio_client(server_params) as (
            read,
            write,
        ):

            async with ClientSession(
                read,
                write,
            ) as session:

                # ------------------------------------------------
                # Initialize MCP connection
                # ------------------------------------------------

                await session.initialize()

                # ------------------------------------------------
                # Get available MCP tools
                # ------------------------------------------------

                tools_result = await session.list_tools()

                tools = tools_result.tools

                if not tools:
                    raise RuntimeError(
                        "MCP server started, but no tools were discovered."
                    )

                # ------------------------------------------------
                # Build tool descriptions
                # ------------------------------------------------

                tool_descriptions = []

                for tool in tools:

                    tool_descriptions.append(
                        {
                            "name": tool.name,
                            "description": tool.description or "",
                            "input_schema": tool.input_schema,
                        }
                    )

                # ------------------------------------------------
                # DeepSeek selects MCP tool
                # ------------------------------------------------

                from langchain_deepseek import ChatDeepSeek

                llm = ChatDeepSeek(
                    model="deepseek-chat",
                    api_key=os.getenv("DEEPSEEK_API_KEY"),
                )

                prompt = f"""
You are an enterprise IT assistant.

Select exactly one MCP tool that can perform the
user's requested Jira operation.

Available MCP tools:

{json.dumps(tool_descriptions, indent=2)}

User request:
{question}

Return ONLY valid JSON:

{{
    "tool_name": "selected_tool_name",
    "arguments": {{
        "argument_name": "argument_value"
    }}
}}

Rules:
- Use only the available tools.
- Use only arguments defined by the selected tool.
- Do not invent tool names.
- Do not invent required arguments.
- Do not add unnecessary arguments.
"""

                response = await llm.ainvoke(prompt)

                content = response.content

                if isinstance(content, list):
                    content = "".join(
                        item.get("text", "")
                        if isinstance(item, dict)
                        else str(item)
                        for item in content
                    )

                # ------------------------------------------------
                # Parse LLM decision
                # ------------------------------------------------

                decision = json.loads(content)

                tool_name = decision.get("tool_name")
                arguments = decision.get("arguments", {})

                if not tool_name:
                    raise ValueError(
                        "LLM did not return a tool_name."
                    )

                # ------------------------------------------------
                # Validate selected tool
                # ------------------------------------------------

                available_tool_names = {
                    tool.name
                    for tool in tools
                }

                if tool_name not in available_tool_names:
                    raise ValueError(
                        f"Unknown MCP tool selected: {tool_name}. "
                        f"Available tools: "
                        f"{sorted(available_tool_names)}"
                    )

                # ------------------------------------------------
                # Execute MCP tool
                # ------------------------------------------------

                result = await session.call_tool(
                    tool_name,
                    arguments,
                )

                # ------------------------------------------------
                # Return result
                # ------------------------------------------------

                if hasattr(result, "model_dump"):
                    result_data = result.model_dump()

                else:
                    result_data = str(result)

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
# FINAL RESPONSE
# ============================================================

def final_response_node(
    state: GraphState,
) -> GraphState:

    route = state.get("route")

    if route == "rag":
        result = state.get("rag_result")

    elif route == "db":
        result = state.get("db_result")

    elif route == "mcp":
        result = state.get("mcp_result")

    else:
        result = {
            "status": "error",
            "message": "Unknown route",
        }

    final_response = {
        "status": "success",
        "route": route,
        "data": result,
    }

    return {
        **state,
        "final_response": final_response,
    }