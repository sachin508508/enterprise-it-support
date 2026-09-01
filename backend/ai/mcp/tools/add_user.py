from ..jira.operations import add_user_to_project


def add_jira_user_to_project(
    project_id_or_key: str,
    user_account_id: str,
    role_id: int,
) -> dict:
    """Add a Jira user to a project role."""

    return add_user_to_project(
        project_id_or_key=project_id_or_key,
        user_account_id=user_account_id,
        role_id=role_id,
    )
