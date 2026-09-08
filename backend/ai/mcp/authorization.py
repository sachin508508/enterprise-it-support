from ..tool_call.access_control import (
    get_employee_role,
    get_role_level,
)

from ..tool_call.authorization import (
    verify_hitl_approval,
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

    # ---------------------------------------------------------
    # Validate MCP tool
    # ---------------------------------------------------------

    required_level = MCP_TOOL_LEVELS.get(
        tool_name
    )

    if required_level is None:
        raise PermissionError(
            f"MCP tool '{tool_name}' is not authorized."
        )

    # ---------------------------------------------------------
    # Get requester role
    # ---------------------------------------------------------

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
    # Lower-privileged users may proceed only when:
    #
    # 1. HITL execution was explicitly approved.
    # 2. A valid HITL request ID is supplied.
    # 3. An approving administrator is supplied.
    # 4. The HITL request belongs to the requester.
    # 5. The HITL request is actually approved.
    # 6. The recorded reviewer matches approved_by.
    # 7. The reviewer currently has admin privileges.
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

        approval_valid = verify_hitl_approval(
            hitl_id=hitl_id,
            requester_id=employee_id,
            approved_by=approved_by,
        )

        if not approval_valid:
            raise PermissionError(
                "The HITL approval is invalid or no longer active."
            )

        return

    # ---------------------------------------------------------
    # Normal denial
    # ---------------------------------------------------------

    raise PermissionError(
        f"Role '{role}' is not authorized "
        f"to use MCP tool '{tool_name}'."
    )