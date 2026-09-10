import json
import re
from typing import Any


# ============================================================
# CONFIGURATION
# ============================================================

IGNORED_KEYS = {
    "tool",
    "arguments",
    "target_employee_id",
    "error_type",
    "isError",
    "is_error",
    "status",
    "type",
}

PREFERRED_TEXT_KEYS = (
    "summary",
    "answer",
    "response",
    "message",
    "text",
)


# ============================================================
# HELPERS
# ============================================================

def _humanize_key(
    key: str,
) -> str:

    key = key.replace(
        "_",
        " ",
    )

    key = re.sub(
        r"(?<!^)(?=[A-Z])",
        " ",
        key,
    )

    return key.strip().capitalize()


def _format_value(
    value: Any,
) -> str:

    if value is None:
        return "Not available."

    if isinstance(
        value,
        bool,
    ):
        return "Yes" if value else "No"

    if isinstance(
        value,
        (str, int, float),
    ):
        return str(value)

    if isinstance(
        value,
        list,
    ):

        if not value:
            return "None."

        return "\n".join(
            f"• {_format_value(item)}"
            for item in value
        )

    if isinstance(
        value,
        dict,
    ):

        parts = []

        for key, item in value.items():

            if key in IGNORED_KEYS:
                continue

            if item is None:
                continue

            parts.append(
                f"{_humanize_key(key)}: "
                f"{_format_value(item)}"
            )

        return "\n".join(parts)

    return str(value)


def _try_parse_json(
    value: Any,
) -> Any:

    if not isinstance(
        value,
        str,
    ):
        return value

    value = value.strip()

    if not value:
        return value

    try:
        return json.loads(value)
    except Exception:
        return value


# ============================================================
# MCP TEXT EXTRACTION
# ============================================================

def _extract_mcp_text(
    data: Any,
) -> str | None:

    if data is None:
        return None

    if isinstance(
        data,
        str,
    ):
        return data.strip()

    if isinstance(
        data,
        list,
    ):

        for item in data:

            text = _extract_mcp_text(
                item
            )

            if text:
                return text

        return None

    if not isinstance(
        data,
        dict,
    ):
        return None

    # Direct text fields
    for key in PREFERRED_TEXT_KEYS:

        value = data.get(
            key
        )

        if isinstance(
            value,
            str,
        ) and value.strip():

            return value.strip()

    # Nested result
    if "result" in data:

        text = _extract_mcp_text(
            data["result"]
        )

        if text:
            return text

    # Nested data
    if "data" in data:

        text = _extract_mcp_text(
            data["data"]
        )

        if text:
            return text

    return None


# ============================================================
# JIRA PROJECT FORMATTER
# ============================================================

def _format_jira_project(
    data: dict,
) -> str | None:

    if not isinstance(
        data,
        dict,
    ):
        return None

    project_keys = {
        "id",
        "key",
        "name",
        "description",
        "lead",
        "project_type_key",
        "projectTypeKey",
    }

    if not any(
        key in data
        for key in project_keys
    ):
        return None

    parts = []

    if data.get("name"):
        parts.append(
            f"Project: {data['name']}"
        )

    if data.get("key"):
        parts.append(
            f"Key: {data['key']}"
        )

    if data.get("id"):
        parts.append(
            f"Project ID: {data['id']}"
        )

    if data.get("description"):
        parts.append(
            f"Description: {data['description']}"
        )

    if data.get("project_type_key"):
        parts.append(
            f"Project type: "
            f"{data['project_type_key']}"
        )

    if data.get("projectTypeKey"):
        parts.append(
            f"Project type: "
            f"{data['projectTypeKey']}"
        )

    if data.get("lead"):

        lead = data["lead"]

        if isinstance(
            lead,
            dict,
        ):

            lead_name = (
                lead.get("displayName")
                or lead.get("display_name")
                or lead.get("name")
            )

            if lead_name:
                parts.append(
                    f"Lead: {lead_name}"
                )

        else:

            parts.append(
                f"Lead: {lead}"
            )

    return "\n".join(parts) if parts else None


# ============================================================
# HUMAN RESPONSE EXTRACTION
# ============================================================

def extract_human_response(
    result: Any,
) -> str:

    result = _try_parse_json(
        result
    )

    # --------------------------------------------------------
    # String
    # --------------------------------------------------------

    if isinstance(
        result,
        str,
    ):

        return result.strip()

    # --------------------------------------------------------
    # List
    # --------------------------------------------------------

    if isinstance(
        result,
        list,
    ):

        responses = []

        for item in result:

            text = extract_human_response(
                item
            )

            if text:
                responses.append(
                    text
                )

        if responses:

            return "\n\n".join(
                responses
            )

        return "The request was processed, but no additional information was returned."

    # --------------------------------------------------------
    # Non-dict
    # --------------------------------------------------------

    if not isinstance(
        result,
        dict,
    ):

        return str(result)

    # --------------------------------------------------------
    # Preferred response fields
    # --------------------------------------------------------

    for key in PREFERRED_TEXT_KEYS:

        value = result.get(
            key
        )

        if isinstance(
            value,
            str,
        ) and value.strip():

            return value.strip()

    # --------------------------------------------------------
    # MCP nested result
    # --------------------------------------------------------

    if "result" in result:

        nested = result["result"]

        text = _extract_mcp_text(
            nested
        )

        if text:
            return text

        if isinstance(
            nested,
            dict,
        ):

            jira_text = _format_jira_project(
                nested
            )

            if jira_text:
                return jira_text

    # --------------------------------------------------------
    # Nested data
    # --------------------------------------------------------

    if "data" in result:

        text = _extract_mcp_text(
            result["data"]
        )

        if text:
            return text

    # --------------------------------------------------------
    # Jira project
    # --------------------------------------------------------

    jira_text = _format_jira_project(
        result
    )

    if jira_text:
        return jira_text

    # --------------------------------------------------------
    # Generic fallback
    # --------------------------------------------------------

    return _format_value(
        result
    )


# ============================================================
# STATUS
# ============================================================

def get_result_status(
    result: Any,
) -> str:

    if isinstance(
        result,
        list,
    ):

        for item in result:

            status = get_result_status(
                item
            )

            if status in {
                "error",
                "failed",
                "denied",
                "pending",
            }:
                return status

        return "success"

    if not isinstance(
        result,
        dict,
    ):
        return "success"

    status = result.get(
        "status"
    )

    if status in {
        "error",
        "failed",
        "denied",
        "pending",
        "success",
        "successful",
    }:
        return status

    nested = result.get(
        "result"
    )

    if nested is not None:

        nested_status = get_result_status(
            nested
        )

        if nested_status != "success":
            return nested_status

    return "success"


# ============================================================
# FINAL RESPONSE
# ============================================================

def build_final_response(
    route: str | None,
    result: Any,
    message_override: str | None = None,
) -> dict:

    route_query_types = {
        "rag": "RAG",
        "db": "System Information",
        "mcp": "Action",
    }

    status = get_result_status(
        result
    )

    if status == "success":
        normalized_status = "successful"
    elif status == "error":
        normalized_status = "failed"
    else:
        normalized_status = status

    # --------------------------------------------------------
    # Use response LLM when available.
    # Otherwise deterministic formatter.
    # --------------------------------------------------------

    message = (
        message_override.strip()
        if isinstance(
            message_override,
            str,
        )
        and message_override.strip()
        else extract_human_response(
            result
        )
    )

    return {
        "status": normalized_status,
        "route": route,
        "query_type": route_query_types.get(
            route,
            "Other",
        ),
        "message": message,
        "data": result,
    }