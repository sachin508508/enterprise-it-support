from ..jira.operations import create_issue


def create_jira_issue(
    project_id_or_key: str,
    summary: str,
    description: str = "",
    issue_type: str = "Task",
) -> dict:
    """Create a Jira issue."""

    return create_issue(
        project_id_or_key=project_id_or_key,
        summary=summary,
        description=description,
        issue_type=issue_type,
    )
