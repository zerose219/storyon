from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker


# DATABASE_URL = "postgresql+psycopg2://storyon_app:storyon@localhost:5433/storyon_db"
DATABASE_URL = "postgresql+psycopg2://storyon_app:storyon@storyon-postgres:5432/storyon_db"


engine = create_engine(DATABASE_URL)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
