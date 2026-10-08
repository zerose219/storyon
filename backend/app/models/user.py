from datetime import datetime

from sqlalchemy import BigInteger, String, DateTime, CheckConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    __table_args__ = (
        CheckConstraint(
            "login_type IN ('EMAIL', 'GOOGLE', 'KAKAO')",
            name="ck_users_login_type"
        ),
    )

    user_id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    nickname: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False
    )

    password: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    login_type: Mapped[str] = mapped_column(
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

    posts = relationship(
        "Post",
        back_populates="user"
    )

    comments = relationship(
        "Comment",
        back_populates="user"
    )

    post_likes = relationship(
        "PostLike",
        back_populates="user"
    )