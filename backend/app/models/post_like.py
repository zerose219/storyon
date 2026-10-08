from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class PostLike(Base):
    __tablename__ = "post_likes"

    post_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey(
            "posts.post_id",
            ondelete="CASCADE"
        ),
        primary_key=True
    )

    user_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey(
            "users.user_id",
            ondelete="CASCADE"
        ),
        primary_key=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now()
    )

    post = relationship(
        "Post",
        back_populates="post_likes"
    )

    user = relationship(
        "User",
        back_populates="post_likes"
    )