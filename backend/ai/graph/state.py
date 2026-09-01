from typing import Any, TypedDict


class GraphState(TypedDict, total=False):
    user_query: str

    route: str

    rag_result: Any
    db_result: Any
    mcp_result: Any

    final_response: dict

    error: str | None