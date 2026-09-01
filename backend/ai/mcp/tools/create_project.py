from ..jira.operations import create_project


def create_jira_project(
    name: str,
    key: str,
    project_type: str = "business",
    description: str = "",
) -> dict:
    """Create a new Jira project."""

    return create_project(
        name=name,
        key=key,
        project_type=project_type,
        description=description,
    )