from .client import JiraClient


jira = JiraClient()


# ============================================================
# PROJECT OPERATIONS
# ============================================================

def create_project(
    name: str,
    key: str,
    project_type: str = "business",
    description: str = "",
):
    payload = {
        "name": name,
        "key": key,
        "projectTypeKey": project_type,
        "description": description,
        "leadAccountId": "712020:0a35c22a-e1c5-4e92-9bae-a994a449eebb",
    }

    return jira.post(
        "/rest/api/3/project",
        payload,
    )


def get_project_info(
    project_id_or_key: str,
):
    return jira.get(
        f"/rest/api/3/project/{project_id_or_key}"
    )


def add_user_to_project(
    project_id_or_key: str,
    user_account_id: str,
    role_id: int,
):
    payload = {
        "user": [user_account_id],
    }

    return jira.post(
        f"/rest/api/3/project/"
        f"{project_id_or_key}/role/{role_id}",
        payload,
    )


# ============================================================
# ISSUE OPERATIONS
# ============================================================

def create_issue(
    project_id_or_key: str,
    summary: str,
    description: str = "",
    issue_type: str = "Task",
):
    description_adf = {
        "type": "doc",
        "version": 1,
        "content": [
            {
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "text": description,
                    }
                ],
            }
        ],
    }

    payload = {
        "fields": {
            "project": {
                "key": project_id_or_key,
            },
            "summary": summary,
            "description": description_adf,
            "issuetype": {
                "name": issue_type,
            },
        }
    }

    return jira.post(
        "/rest/api/3/issue",
        payload,
    )


def assign_issue(
    issue_id_or_key: str,
    user_account_id: str,
):
    payload = {
        "accountId": user_account_id,
    }

    jira.put(
        f"/rest/api/3/issue/"
        f"{issue_id_or_key}/assignee",
        payload,
    )

    return {
        "success": True,
        "issue": issue_id_or_key,
        "assigned_to": user_account_id,
    }


def resolve_issue(
    issue_id_or_key: str,
):
    endpoint = (
        f"/rest/api/3/issue/"
        f"{issue_id_or_key}/transitions"
    )

    # Get available transitions.
    transitions = jira.get(endpoint).get(
        "transitions",
        []
    )

    resolve_transition = None

    for transition in transitions:
        name = transition["name"].lower()

        if name in [
            "resolve",
            "resolved",
            "done",
            "close",
            "closed",
        ]:
            resolve_transition = transition
            break

    if not resolve_transition:
        available = [
            f'{t["id"]}: {t["name"]}'
            for t in transitions
        ]

        raise RuntimeError(
            "No suitable resolve transition is available "
            f"for this issue. Available transitions: {available}"
        )

    transition_id = resolve_transition["id"]

    payload = {
        "transition": {
            "id": transition_id,
        }
    }

    jira.post(
        endpoint,
        payload,
    )

    return {
        "success": True,
        "issue": issue_id_or_key,
        "transition": resolve_transition["name"],
        "transition_id": transition_id,
        "message": (
            f"Issue {issue_id_or_key} successfully moved "
            f"to {resolve_transition['name']}."
        ),
    }