from pydantic import BaseModel


class RecentActivity(BaseModel):
    id: str
    query: str
    query_type: str
    status: str
    created_at: str | None


class DashboardResponse(BaseModel):
    status: str

    total_queries: int
    rag_queries: int
    action_queries: int
    system_information_queries: int

    successful: int
    failed: int
    denied: int

    hitl_pending: int

    recent_activity: list[RecentActivity]