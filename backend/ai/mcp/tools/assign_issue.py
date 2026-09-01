from ..jira.operations import assign_issue


def assign_jira_issue(
    issue_id_or_key: str,
    user_account_id: str,
) -> dict:
    """Assign a Jira issue to a user."""

    return assign_issue(
        issue_id_or_key=issue_id_or_key,
        user_account_id=user_account_id,
    )
