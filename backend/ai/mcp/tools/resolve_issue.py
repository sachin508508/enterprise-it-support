from ..jira.operations import resolve_issue


def resolve_jira_issue(
    issue_id_or_key: str,
) -> dict:
    """Resolve a Jira issue."""

    return resolve_issue(
        issue_id_or_key=issue_id_or_key
    )