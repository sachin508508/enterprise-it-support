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
                    "Select the appropriate database tool for the user's request. "
                    "If the user says 'my', 'me', or 'myself', "
                    f"use employee ID '{employee_id}'. "
                    "If the user explicitly provides another employee ID, "
                    "use that employee ID. "
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

    if not message.tool_calls:
        return {
            "type": "text",
            "content": message.content,
        }

    results = []

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

        # -------------------------------------------------
        # Resolve "my" requests to authenticated employee
        # -------------------------------------------------

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

        # -------------------------------------------------
        # Authorization
        # -------------------------------------------------

        authorize_tool_call(
            tool_name=tool_name,
            requester_id=employee_id,
            arguments=arguments,
            hitl_approved=hitl_approved,
            hitl_id=hitl_id,
            approved_by=approved_by,
        )

        # -------------------------------------------------
        # Execute tool
        # -------------------------------------------------

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


if __name__ == "__main__":

    employee_id = input(
        "Employee ID: "
    ).strip()

    question = input(
        "You: "
    ).strip()

    try:

        result = run_tool_call(
            question,
            employee_id=employee_id,
        )

        print(
            json.dumps(
                result,
                indent=2,
                default=str,
            )
        )

    except PermissionError as e:

        print(
            json.dumps(
                {
                    "status": "denied",
                    "message": str(e),
                },
                indent=2,
            )
        )

    except Exception as e:

        print(
            json.dumps(
                {
                    "status": "error",
                    "message": str(e),
                },
                indent=2,
            )
        )