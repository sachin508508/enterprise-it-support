import json

from .llm.llm_deepseek import get_deepseek_client
from .llm.tool_definitions import TOOL_DEFINITIONS

from .tools.get_employee import get_employee_details
from .tools.get_project import get_project_details
from .tools.get_system_access import get_system_access
from .tools.get_employee_configurations import get_employee_configurations
from .tools.get_jira_accounts import get_jira_account


TOOL_FUNCTIONS = {
    "get_employee_details": get_employee_details,
    "get_project_details": get_project_details,
    "get_system_access": get_system_access,
    "get_employee_configurations": get_employee_configurations,
    "get_jira_account": get_jira_account,
}


def run_tool_call(question: str):

    client = get_deepseek_client()

    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {
                "role": "user",
                "content": question
            }
        ],
        tools=TOOL_DEFINITIONS,
        tool_choice="auto"
    )

    message = response.choices[0].message

    if not message.tool_calls:
        return {
            "type": "text",
            "content": message.content
        }

    results = []

    for tool_call in message.tool_calls:

        tool_name = tool_call.function.name

        arguments = json.loads(
            tool_call.function.arguments
        )

        tool_function = TOOL_FUNCTIONS.get(tool_name)

        if not tool_function:
            raise ValueError(
                f"Unknown tool: {tool_name}"
            )

        result = tool_function(**arguments)

        results.append({
            "tool": tool_name,
            "result": result
        })

    return results

if __name__ == "__main__":

    print("=" * 60)
    print("PostgreSQL Tool Calling")
    print("=" * 60)

    while True:

        question = input("\nYou: ").strip()

        if question.lower() in {"exit", "quit"}:
            print("Exiting...")
            break

        if not question:
            continue

        try:

            result = run_tool_call(question)

            print("\nResult:")
            print(json.dumps(
                result,
                indent=2,
                default=str
            ))

        except Exception as e:

            print("\nError:")
            print(str(e))