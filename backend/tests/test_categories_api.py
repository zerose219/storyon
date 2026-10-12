
from app.database import SessionLocal
from app.models.category import Category


def test_get_categories_success(client):
    # 1. 테스트 DB에 카테고리 2개 생성
    db = SessionLocal()
    try:
        db.add_all([
            Category(category_name="Python"),
            Category(category_name="Network"),
        ])
        db.commit()
    finally:
        db.close()

    # 2. 카테고리 목록 조회
    response = client.get("/api/categories")

    # 3. 응답 확인
    assert response.status_code == 200

    data = response.json()
    assert len(data) == 2

    category_names = {category["category_name"] for category in data}
    assert category_names == {"Python", "Network"}



def test_get_categories_empty(client):
    # 1. 카테고리 목록 조회
    # 테스트 DB는 매 테스트마다 초기화되므로 카테고리가 없는 상태야.
    response = client.get("/api/categories")

    # 2. 응답 확인
    assert response.status_code == 200
    assert response.json() == []
