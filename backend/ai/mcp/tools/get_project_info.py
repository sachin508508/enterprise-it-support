from ..jira.operations import get_project_info


def get_jira_project_info(
    project_id_or_key: str,
) -> dict:
    """Get information about a Jira project."""

    return get_project_info(
        project_id_or_key
    )