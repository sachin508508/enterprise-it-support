import os

from mcp.server.mcpserver import MCPServer

from .authorization import authorize_mcp_tool

from .tools.create_project import create_jira_project
from .tools.get_project_info import get_jira_project_info
from .tools.add_user import add_jira_user_to_project
from .tools.create_issue import create_jira_issue
from .tools.assign_issue import assign_jira_issue
from .tools.resolve_issue import resolve_jira_issue


server = MCPServer(
    name="jira-mcp"
)


def get_authenticated_employee_id() -> str:

    employee_id = os.getenv(
        "MCP_EMPLOYEE_ID"
    )

    if not employee_id:
        raise PermissionError(
            "Authenticated employee ID is required."
        )

    return employee_id


def get_hitl_context() -> dict:

    hitl_approved = (
        os.getenv(
            "MCP_HITL_APPROVED",
            "false",
        ).lower()
        == "true"
    )

    return {
        "hitl_approved": hitl_approved,
        "hitl_id": os.getenv(
            "MCP_HITL_ID"
        ),
        "approved_by": os.getenv(
            "MCP_APPROVED_BY"
        ),
    }


@server.tool()
def create_jira_project_authorized(
    name: str,
    key: str,
):

    employee_id = get_authenticated_employee_id()

    hitl_context = get_hitl_context()

    authorize_mcp_tool(
        tool_name="create_jira_project",
        employee_id=employee_id,
        **hitl_context,
    )

    return create_jira_project(
        name=name,
        key=key,
    )


@server.tool()
def get_jira_project_info_authorized(
    project_id_or_key: str,
):

    employee_id = get_authenticated_employee_id()

    hitl_context = get_hitl_context()

    authorize_mcp_tool(
        tool_name="get_jira_project_info",
        employee_id=employee_id,
        **hitl_context,
    )

    return get_jira_project_info(
        project_id_or_key=project_id_or_key,
    )


@server.tool()
def add_jira_user_to_project_authorized(
    project_id_or_key: str,
    user_account_id: str,
    role_id: str,
):

    employee_id = get_authenticated_employee_id()

    hitl_context = get_hitl_context()

    authorize_mcp_tool(
        tool_name="add_jira_user_to_project",
        employee_id=employee_id,
        **hitl_context,
    )

    return add_jira_user_to_project(
        project_id_or_key=project_id_or_key,
        user_account_id=user_account_id,
        role_id=role_id,
    )


@server.tool()
def create_jira_issue_authorized(
    project_id_or_key: str,
    summary: str,
    description: str = "",
    issue_type: str = "Task",
):

    employee_id = get_authenticated_employee_id()

    hitl_context = get_hitl_context()

    authorize_mcp_tool(
        tool_name="create_jira_issue",
        employee_id=employee_id,
        **hitl_context,
    )

    return create_jira_issue(
        project_id_or_key=project_id_or_key,
        summary=summary,
        description=description,
        issue_type=issue_type,
    )


@server.tool()
def assign_jira_issue_authorized(
    issue_id_or_key: str,
    user_account_id: str,
):

    employee_id = get_authenticated_employee_id()

    hitl_context = get_hitl_context()

    authorize_mcp_tool(
        tool_name="assign_jira_issue",
        employee_id=employee_id,
        **hitl_context,
    )

    return assign_jira_issue(
        issue_id_or_key=issue_id_or_key,
        user_account_id=user_account_id,
    )


@server.tool()
def resolve_jira_issue_authorized(
    issue_id_or_key: str,
):

    employee_id = get_authenticated_employee_id()

    hitl_context = get_hitl_context()

    authorize_mcp_tool(
        tool_name="resolve_jira_issue",
        employee_id=employee_id,
        **hitl_context,
    )

    return resolve_jira_issue(
        issue_id_or_key=issue_id_or_key,
    )


if __name__ == "__main__":

    server.run(
        transport="stdio"
    )