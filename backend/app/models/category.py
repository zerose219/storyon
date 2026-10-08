from sqlalchemy import BigInteger, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Category(Base):
    __tablename__ = "categories"

    category_id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    category_name: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False
    )

    posts = relationship(
        "Post",
        back_populates="category"
    )