from typing import Any


IGNORED_KEYS = {
    "status",
    "route",
    "type",
    "sources",
    "needs_action",
    "tool",
    "arguments",
    "error_type",
    "meta",
    "annotations",
    "structured_content",
    "result_type",
    "self",
    "avatarUrls",
    "iconUrl",
}


PREFERRED_TEXT_KEYS = (
    "summary",
    "answer",
    "response",
    "message",
    "text",
)


def _humanize_key(key: str) -> str:
    return key.replace("_", " ").strip().capitalize()


def _format_value(value: Any) -> str:
    if value is None:
        return ""

    if isinstance(value, str):
        return value.strip()

    if isinstance(value, (int, float, bool)):
        return str(value)

    if isinstance(value, list):
        parts = []

        for item in value:
            formatted = _format_value(item)

            if formatted:
                parts.append(formatted)

        return "\n".join(parts)

    if isinstance(value, dict):
        parts = []

        for key, item in value.items():
            if key in IGNORED_KEYS:
                continue

            formatted = _format_value(item)

            if not formatted:
                continue

            parts.append(
                f"{_humanize_key(key)}: {formatted}"
            )

        return "\n".join(parts)

    return str(value)


def _extract_mcp_text(result: Any) -> str:
    """
    Extract the actual text returned by an MCP tool.

    Typical MCP structure:

    {
        "status": "success",
        "tool": "...",
        "result": {
            "content": [
                {
                    "type": "text",
                    "text": "{ ... Jira JSON ... }"
                }
            ]
        }
    }
    """

    if not isinstance(result, dict):
        return ""

    mcp_result = result.get("result")

    if not isinstance(mcp_result, dict):
        return ""

    content = mcp_result.get("content")

    if not isinstance(content, list):
        return ""

    for item in content:
        if not isinstance(item, dict):
            continue

        if item.get("type") != "text":
            continue

        text = item.get("text")

        if isinstance(text, str) and text.strip():
            return text.strip()

    return ""


def _format_jira_project(data: dict) -> str:
    """
    Convert Jira project JSON into a concise human-readable response.
    """

    key = data.get("key")
    name = data.get("name")
    project_id = data.get("id")
    project_type = data.get("projectTypeKey")
    simplified = data.get("simplified")
    is_private = data.get("isPrivate")

    lead = data.get("lead")

    lead_name = None

    if isinstance(lead, dict):
        lead_name = lead.get("displayName")

    lines = []

    if key:
        lines.append(f"Jira project: {key}")

    if name:
        lines.append(f"Name: {name}")

    if project_id:
        lines.append(f"Project ID: {project_id}")

    if project_type:
        lines.append(
            f"Project type: {_humanize_key(project_type)}"
        )

    if lead_name:
        lines.append(f"Project lead: {lead_name}")

    if simplified is not None:
        lines.append(
            f"Project style: "
            f"{'Next-gen' if simplified else 'Classic'}"
        )

    if is_private is not None:
        lines.append(
            f"Visibility: "
            f"{'Private' if is_private else 'Public'}"
        )

    issue_types = data.get("issueTypes")

    if isinstance(issue_types, list):
        issue_names = []

        for issue_type in issue_types:
            if not isinstance(issue_type, dict):
                continue

            issue_name = issue_type.get("name")

            if issue_name:
                issue_names.append(issue_name)

        if issue_names:
            lines.append(
                "Issue types: " + ", ".join(issue_names)
            )

    return "\n".join(lines)


def _try_parse_json(text: str) -> Any:
    import json

    try:
        return json.loads(text)
    except (json.JSONDecodeError, TypeError):
        return None


def extract_human_response(result: Any) -> str:
    if result is None:
        return ""

    if isinstance(result, str):
        return result.strip()

    if isinstance(result, list):
        text_parts = []

        for item in result:
            text = extract_human_response(item)

            if text:
                text_parts.append(text)

        return "\n".join(text_parts).strip()

    if isinstance(result, dict):

        # ---------------------------------------------------------
        # MCP Jira result
        # ---------------------------------------------------------
        mcp_text = _extract_mcp_text(result)

        if mcp_text:
            parsed = _try_parse_json(mcp_text)

            if isinstance(parsed, dict):

                # Jira project information
                if (
                    parsed.get("key")
                    and parsed.get("name")
                    and parsed.get("projectTypeKey")
                ):
                    return _format_jira_project(parsed)

                # Generic JSON result
                return _format_value(parsed)

            return mcp_text

        # ---------------------------------------------------------
        # Normal preferred response fields
        # ---------------------------------------------------------
        for key in PREFERRED_TEXT_KEYS:

            if key not in result:
                continue

            value = result[key]

            text = extract_human_response(value)

            if text:
                return text

        # ---------------------------------------------------------
        # Nested content
        # ---------------------------------------------------------
        if "content" in result:
            text = extract_human_response(
                result["content"]
            )

            if text:
                return text

        # ---------------------------------------------------------
        # Generic dictionary
        # ---------------------------------------------------------
        text = _format_value(result)

        if text:
            return text

        return ""

    return str(result).strip()


def get_result_status(result: Any) -> str:
    if isinstance(result, dict):

        status = result.get("status")

        if status in {
            "failed",
            "error",
            "denied",
            "pending",
            "success",
            "successful",
        }:
            if status == "error":
                return "failed"

            if status == "success":
                return "successful"

            return status

        if "data" in result:
            return get_result_status(
                result["data"]
            )

        if "result" in result:
            return get_result_status(
                result["result"]
            )

    return "successful"


def build_final_response(
    route: str | None,
    result: Any,
) -> dict:

    status = get_result_status(result)

    if status == "error":
        status = "failed"

    message = extract_human_response(result)

    if not message:

        if status == "failed":
            message = (
                "The AI could not complete your request."
            )

        elif status == "denied":
            message = "Your request was denied."

        elif status == "pending":
            message = (
                "Your request is pending review."
            )

        else:
            message = "Your request was processed."

    query_type_map = {
        "rag": "RAG",
        "db": "System Information",
        "mcp": "Action",
    }

    return {
        "status": status,
        "route": route,
        "query_type": query_type_map.get(
            route,
            "Other",
        ),
        "message": message,

        # Keep complete backend data for:
        # - audit
        # - debugging
        # - HITL
        # - future UI timelines
        #
        # This data should NOT be directly displayed
        # as the user-facing message.
        "data": result,
    }