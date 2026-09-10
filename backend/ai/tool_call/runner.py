import json

from .llm.deepseek import get_deepseek_client
from .llm.tool_definitions import TOOL_DEFINITIONS
from .authorization import authorize_tool_call

from .tools.get_employee import get_employee_details
from .tools.get_project import get_project_details
from .tools.get_system_access import get_system_access
from .tools.get_employee_configurations import (
    get_employee_configurations,
)
from .tools.get_jira_accounts import get_jira_account


TOOL_FUNCTIONS = {
    "get_employee_details": get_employee_details,
    "get_project_details": get_project_details,
    "get_system_access": get_system_access,
    "get_employee_configurations": get_employee_configurations,
    "get_jira_account": get_jira_account,
}


# ============================================================
# DATABASE TOOL CALL
# ============================================================

def run_tool_call(
    question: str,
    employee_id: str,
    hitl_approved: bool = False,
    hitl_id: str | None = None,
    approved_by: str | None = None,
):
    if not employee_id:
        raise ValueError(
            "Authenticated employee ID is required."
        )

    client = get_deepseek_client()

    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an enterprise IT support assistant. "
                    "Select the appropriate database tool for the "
                    "user's request. "
                    f"If the user says 'my', 'me', or 'myself', "
                    f"use employee ID '{employee_id}'. "
                    "If the user explicitly provides another "
                    "employee ID, use that employee ID. "
                    "Do not invent employee IDs."
                ),
            },
            {
                "role": "user",
                "content": question,
            },
        ],
        tools=TOOL_DEFINITIONS,
        tool_choice="auto",
    )

    message = response.choices[0].message

    # --------------------------------------------------------
    # No tool required
    # --------------------------------------------------------

    if not message.tool_calls:
        return {
            "type": "text",
            "content": message.content,
        }

    results = []

    # --------------------------------------------------------
    # Execute selected tools
    # --------------------------------------------------------

    for tool_call in message.tool_calls:

        tool_name = tool_call.function.name

        arguments = json.loads(
            tool_call.function.arguments
        )

        tool_function = TOOL_FUNCTIONS.get(
            tool_name
        )

        if not tool_function:
            raise ValueError(
                f"Unknown tool: {tool_name}"
            )

        # Automatically use authenticated employee
        # for employee-specific tools.
        if (
            tool_name
            in {
                "get_employee_details",
                "get_system_access",
                "get_employee_configurations",
                "get_jira_account",
            }
            and not arguments.get("employee_id")
        ):
            arguments["employee_id"] = employee_id

        target_employee_id = arguments.get(
            "employee_id"
        )

        authorize_tool_call(
            tool_name=tool_name,
            requester_id=employee_id,
            arguments=arguments,
            hitl_approved=hitl_approved,
            hitl_id=hitl_id,
            approved_by=approved_by,
        )

        result = tool_function(
            **arguments
        )

        results.append(
            {
                "tool": tool_name,
                "target_employee_id": target_employee_id,
                "result": result,
            }
        )

    return results


# ============================================================
# RESPONSE LLM
# ============================================================

def generate_tool_response(
    question: str,
    tool_results,
) -> str | None:
    """
    Convert raw DB/tool results into a natural-language
    response for the user.

    Returns None if response generation fails so that the
    deterministic formatter can be used as fallback.
    """

    try:

        client = get_deepseek_client()

        serialized_results = json.dumps(
            tool_results,
            indent=2,
            default=str,
        )

        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are the final response assistant "
                        "for an enterprise IT support system.\n\n"
                        "Answer the user's request using ONLY "
                        "the provided tool results.\n\n"
                        "Rules:\n"
                        "- Do not invent information.\n"
                        "- Do not expose tool names.\n"
                        "- Do not expose tool arguments.\n"
                        "- Do not expose internal implementation "
                        "details.\n"
                        "- Do not mention databases, APIs, "
                        "internal code, or system internals "
                        "unless the user explicitly asks.\n"
                        "- Clearly explain the result.\n"
                        "- If the requested information was found, "
                        "state it directly.\n"
                        "- If the operation failed, clearly explain "
                        "that it could not be completed.\n"
                        "- If access was denied, clearly explain "
                        "that the request was denied without "
                        "revealing security internals.\n"
                        "- Be concise and professional."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"USER REQUEST:\n"
                        f"{question}\n\n"
                        f"TOOL RESULTS:\n"
                        f"{serialized_results}"
                    ),
                },
            ],
        )

        content = response.choices[0].message.content

        if not content:
            return None

        return str(content).strip()

    except Exception as e:

        print(
            "[RESPONSE LLM ERROR] "
            f"{type(e).__name__}: {e}",
            flush=True,
        )

        return None