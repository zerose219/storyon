from datetime import datetime

from sqlalchemy import (
    BigInteger,
    String,
    Text,
    DateTime,
    ForeignKey,
    CheckConstraint,
    Index,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Post(Base):
    __tablename__ = "posts"

    __table_args__ = (
        CheckConstraint(
            "status IN ('DRAFT', 'PUBLISHED')",
            name="ck_posts_status"
        ),
        CheckConstraint(
            "visibility IN ('PUBLIC', 'PRIVATE')",
            name="ck_posts_visibility"
        ),
        Index("idx_posts_user_id", "user_id"),
        Index("idx_posts_category_id", "category_id"),
    )

    post_id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    user_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey(
            "users.user_id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    content: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    category_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey(
            "categories.category_id",
            ondelete="RESTRICT"
        ),
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    visibility: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now()
    )

    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )

    user = relationship(
        "User",
        back_populates="posts"
    )

    category = relationship(
        "Category",
        back_populates="posts"
    )

    comments = relationship(
        "Comment",
        back_populates="post",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    post_likes = relationship(
        "PostLike",
        back_populates="post",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )