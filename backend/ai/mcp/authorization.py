from ..tool_call.access_control import (
    get_employee_role,
    get_role_level,
)


MCP_TOOL_LEVELS = {
    # Level 1+
    "get_jira_project_info": 1,
    "create_jira_issue": 1,
    "assign_jira_issue": 1,
    "resolve_jira_issue": 1,

    # Level 3+
    "create_jira_project": 3,
    "add_jira_user_to_project": 3,
}


def authorize_mcp_tool(
    tool_name: str,
    employee_id: str,
    hitl_approved: bool = False,
    hitl_id: str | None = None,
    approved_by: str | None = None,
) -> None:

    required_level = MCP_TOOL_LEVELS.get(
        tool_name
    )

    if required_level is None:
        raise PermissionError(
            f"MCP tool '{tool_name}' is not authorized."
        )

    role = get_employee_role(
        employee_id
    )

    if role is None:
        raise PermissionError(
            "Employee role could not be determined."
        )

    user_level = get_role_level(
        role
    )

    # ---------------------------------------------------------
    # Normal authorization
    # ---------------------------------------------------------

    if user_level >= required_level:
        return

    # ---------------------------------------------------------
    # HITL authorization
    #
    # A lower-privileged employee may proceed only when
    # this execution was explicitly approved by an admin.
    # ---------------------------------------------------------

    if hitl_approved:

        if not hitl_id:
            raise PermissionError(
                "HITL approval ID is required."
            )

        if not approved_by:
            raise PermissionError(
                "HITL approving administrator is required."
            )

        return

    # ---------------------------------------------------------
    # Normal denial
    # ---------------------------------------------------------

    raise PermissionError(
        f"Role '{role}' is not authorized "
        f"to use MCP tool '{tool_name}'."
    )