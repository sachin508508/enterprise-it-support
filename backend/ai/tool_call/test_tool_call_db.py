import json

from .tools.get_employee import get_employee_details
from .tools.get_project import get_project_details
from .tools.get_system_access import get_system_access
from .tools.get_employee_configurations import (
    get_employee_configurations,
)
from .tools.get_jira_accounts import get_jira_account


def print_result(name, result):
    print("\n" + "=" * 70)
    print(name)
    print("=" * 70)

    print(json.dumps(
        result,
        indent=2,
        default=str
    ))


def main():

    print("\nTesting PostgreSQL tool layer...\n")

    # 1. Employee
    result = get_employee_details("EMP001")
    print_result(
        "get_employee_details",
        result
    )

    # 2. Project
    result = get_project_details("PROJ001")
    print_result(
        "get_project_details",
        result
    )

    # 3. System access
    result = get_system_access("EMP001")
    print_result(
        "get_system_access",
        result
    )

    # 4. Employee configuration
    result = get_employee_configurations("EMP001")
    print_result(
        "get_employee_configurations",
        result
    )

    # 5. Jira account
    result = get_jira_account("EMP001")
    print_result(
        "get_jira_account",
        result
    )

    print("\n" + "=" * 70)
    print("ALL DATABASE TOOLS EXECUTED")
    print("=" * 70)


if __name__ == "__main__":
    main()