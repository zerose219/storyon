
from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_check():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_health_check_db():
    response = client.get("/health/db")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "database": "connected",
    }



def test_posts_api_requires_authentication():
    response = client.get("/api/posts")

    assert response.status_code == 401
