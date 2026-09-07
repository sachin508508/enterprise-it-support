from typing import Literal

from pydantic import BaseModel, Field


class HITLSubmitRequest(BaseModel):
    conversation_id: str

    reason: str = Field(
        min_length=5,
        max_length=2000,
    )


class HITLReviewRequest(BaseModel):

    status: Literal[
        "approved",
        "rejected",
    ]

    review_comment: str | None = Field(
        default=None,
        max_length=2000,
    )