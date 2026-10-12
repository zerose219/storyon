import os

os.environ["DATABASE_URL"] = (
    "postgresql+psycopg2://storyon_app:storyon@localhost:5433/storyon_test_db"
)

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.main import app
from app.database import engine

from app.database import SessionLocal, engine
from app.models.category import Category

@pytest.fixture(autouse=True)
def clean_test_database():
    if not engine.url.database.endswith("_test_db"):
        raise RuntimeError("테스트 DB가 아닙니다. 데이터 초기화를 중단합니다.")

    print("테스트 DB:", engine.url.database)
    print("테스트 DB 초기화 실행")

    with engine.begin() as connection:
        connection.execute(
            text(
                """
                TRUNCATE TABLE
                    post_likes,
                    comments,
                    posts,
                    categories,
                    users
                RESTART IDENTITY CASCADE
                """
            )
        )

    print("테스트 DB 초기화 완료")
    yield

@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client




@pytest.fixture
def create_user(client):
    """테스트용 회원을 생성하고 로그인 정보를 반환한다."""

    def _create_user(
        nickname="testuser",
        email="testuser@example.com",
        password="password123",
    ):
        signup_response = client.post(
            "/api/auth/signup",
            json={
                "nickname": nickname,
                "email": email,
                "password": password,
            },
        )
        assert signup_response.status_code in (200, 201)

        login_response = client.post(
            "/api/auth/login",
            json={
                "email": email,
                "password": password,
            },
        )
        assert login_response.status_code == 200

        token = login_response.json()["access_token"]

        return {
            "nickname": nickname,
            "email": email,
            "password": password,
            "token": token,
            "headers": {"Authorization": f"Bearer {token}"},
        }

    return _create_user



@pytest.fixture
def create_category():
    def _create_category(category_name="Python"):
        db = SessionLocal()
        try:
            category = Category(category_name=category_name)
            db.add(category)
            db.commit()
            db.refresh(category)
            return category.category_id
        finally:
            db.close()

    return _create_category