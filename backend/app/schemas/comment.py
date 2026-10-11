from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class CommentCreate(BaseModel):
    content: str = Field(min_length=1)
    is_public: Literal["PUBLIC", "PRIVATE"] = "PUBLIC"


class CommentUpdate(BaseModel):
    content: str | None = Field(default=None, min_length=1)
    is_public: Literal["PUBLIC", "PRIVATE"] | None = None


class CommentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    comment_id: int
    post_id: int
    user_id: int
    content: str
    is_public: str
    created_at: datetime
    updated_at: datetime | None
    nickname: str