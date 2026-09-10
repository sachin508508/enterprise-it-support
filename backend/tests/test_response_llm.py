import json

from backend.ai.tool_call.runner import (
    generate_tool_response,
)


# ============================================================
# TEST DATA
# ============================================================

USER_QUERY = (
    "What is my current system access?"
)

TOOL_RESULTS = [
    {
        "tool": "get_system_access",
        "target_employee_id": "EMP001",
        "result": {
            "employee_id": "EMP001",
            "system": "Jira",
            "project": "KAN",
            "access_level": "Developer",
            "status": "Active",
        },
    }
]


# ============================================================
# TEST
# ============================================================

def main():

    print("\n========================================")
    print(" RESPONSE LLM TEST")
    print("========================================\n")

    print("USER QUERY:")
    print(USER_QUERY)

    print("\nTOOL RESULT:")
    print(
        json.dumps(
            TOOL_RESULTS,
            indent=2,
        )
    )

    print("\nGenerating final response...\n")

    response = generate_tool_response(
        question=USER_QUERY,
        tool_results=TOOL_RESULTS,
    )

    print("----------------------------------------")

    if response:

        print("RESPONSE LLM OUTPUT:")
        print(response)

        print("\n----------------------------------------")
        print("PASS: Response LLM generated output.")
        print("----------------------------------------")

    else:

        print(
            "FAIL: Response LLM returned no response."
        )

        raise SystemExit(1)


if __name__ == "__main__":
    main()