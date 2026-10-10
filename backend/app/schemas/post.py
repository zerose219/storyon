
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class PostCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    content: str = Field(min_length=1)
    category_id: int = Field(gt=0)
    status: Literal["DRAFT", "PUBLISHED"] = "DRAFT"
    visibility: Literal["PUBLIC", "PRIVATE"] = "PUBLIC"


class PostUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    content: str | None = Field(default=None, min_length=1)
    category_id: int | None = Field(default=None, gt=0)
    status: Literal["DRAFT", "PUBLISHED"] | None = None
    visibility: Literal["PUBLIC", "PRIVATE"] | None = None


class PostResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    post_id: int
    user_id: int
    title: str
    content: str
    category_id: int
    status: str
    visibility: str
    created_at: datetime
    updated_at: datetime | None
