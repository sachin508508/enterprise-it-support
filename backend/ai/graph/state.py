from typing import Any, TypedDict


class GraphState(TypedDict, total=False):
    user_query: str

    # Authenticated employee who originally made the request
    employee_id: str

    # Normal request vs administrator-approved HITL execution
    hitl_approved: bool
    hitl_id: str
    approved_by: str

    route: str

    rag_result: Any
    db_result: Any
    mcp_result: Any

    final_response: dict

    error: str | None