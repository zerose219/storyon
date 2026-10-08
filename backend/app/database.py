from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase


DATABASE_URL = "postgresql+psycopg2://storyon_app:storyon@localhost:5433/storyon_db"


engine = create_engine(DATABASE_URL)


class Base(DeclarativeBase):
    pass