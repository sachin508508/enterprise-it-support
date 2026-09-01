from mcp.server.mcpserver import MCPServer

from .tools.create_project import create_jira_project
from .tools.get_project_info import get_jira_project_info
from .tools.add_user import add_jira_user_to_project
from .tools.create_issue import create_jira_issue
from .tools.assign_issue import assign_jira_issue
from .tools.resolve_issue import resolve_jira_issue


server = MCPServer(
    name="jira-mcp"
)


server.tool()(create_jira_project)
server.tool()(get_jira_project_info)
server.tool()(add_jira_user_to_project)
server.tool()(create_jira_issue)
server.tool()(assign_jira_issue)
server.tool()(resolve_jira_issue)


if __name__ == "__main__":
    server.run(transport="stdio")