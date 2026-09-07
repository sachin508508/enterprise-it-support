from pydantic import BaseModel, Field

from ..security_config import MAX_QUERY_LENGTH


class ChatRequest(BaseModel):
    query: str = Field(
        min_length=1,
        max_length=MAX_QUERY_LENGTH,
    )


class ChatResponse(BaseModel):
    request_id: str
    status: str
    query_type: str
    response: dict