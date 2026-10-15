
from app.database import SessionLocal
from app.models.category import Category
from app.models.comment import Comment
from app.models.post_like import PostLike
from app.redis_client import redis_client, POSTS_CACHE_KEY
from unittest.mock import patch

import json
def test_create_post_success(client, create_user, create_category):
    user = create_user(
        nickname="postuser",
        email="postuser@example.com",
    )
    headers = user["headers"]
    category_id = create_category()

    response = client.post(
        "/api/posts",
        headers=headers,
        json={
            "title": "첫 번째 테스트 게시글",
            "content": "게시글 작성 API 테스트입니다.",
            "category_id": category_id,
            "status": "PUBLISHED",
            "visibility": "PUBLIC",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "첫 번째 테스트 게시글"
    assert data["content"] == "게시글 작성 API 테스트입니다."
    assert data["category_id"] == category_id


def test_create_post_category_not_found(client, create_user):
    user = create_user(
        nickname="postuser",
        email="postuser@example.com",
    )

    response = client.post(
        "/api/posts",
        headers=user["headers"],
        json={
            "title": "카테고리 없는 게시글",
            "content": "존재하지 않는 카테고리를 지정합니다.",
            "category_id": 999999,
            "status": "PUBLISHED",
            "visibility": "PUBLIC",
        },
    )

    assert response.status_code == 404


def test_create_post_without_token(client):
    response = client.post(
        "/api/posts",
        json={
            "title": "인증 없는 게시글",
            "content": "토큰 없이 게시글을 작성합니다.",
            "category_id": 1,
            "status": "PUBLISHED",
            "visibility": "PUBLIC",
        },
    )

    assert response.status_code == 401


def test_get_posts_success(client, create_user, create_category):
    user = create_user(
        nickname="listuser",
        email="listuser@example.com",
    )
    headers = user["headers"]
    category_id = create_category()

    create_response = client.post(
        "/api/posts",
        headers=headers,
        json={
            "title": "목록 조회 테스트",
            "content": "게시글 목록 조회를 확인합니다.",
            "category_id": category_id,
            "status": "PUBLISHED",
            "visibility": "PUBLIC",
        },
    )
    assert create_response.status_code == 201

    response = client.get("/api/posts", headers=headers)

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "목록 조회 테스트"


def test_get_my_posts_success(client, create_user, create_category):
    user = create_user(
        nickname="mylistuser",
        email="mylistuser@example.com",
    )
    headers = user["headers"]
    category_id = create_category()

    create_response = client.post(
        "/api/posts",
        headers=headers,
        json={
            "title": "내 게시글 조회 테스트",
            "content": "내가 작성한 게시글 목록을 확인합니다.",
            "category_id": category_id,
            "status": "PUBLISHED",
            "visibility": "PUBLIC",
        },
    )
    assert create_response.status_code == 201

    response = client.get("/api/posts/my", headers=headers)

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "내 게시글 조회 테스트"


def test_get_post_detail_success(client, create_user, create_category):
    user = create_user(
        nickname="detailuser",
        email="detailuser@example.com",
    )
    headers = user["headers"]
    category_id = create_category()

    create_response = client.post(
        "/api/posts",
        headers=headers,
        json={
            "title": "상세 조회 테스트",
            "content": "게시글 상세 내용을 확인합니다.",
            "category_id": category_id,
            "status": "PUBLISHED",
            "visibility": "PUBLIC",
        },
    )
    assert create_response.status_code == 201
    post_id = create_response.json()["post_id"]

    response = client.get(
        f"/api/posts/{post_id}",
        headers=headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["post_id"] == post_id
    assert data["title"] == "상세 조회 테스트"
    assert data["content"] == "게시글 상세 내용을 확인합니다."


def test_get_post_not_found(client, create_user):
    user = create_user(
        nickname="missinguser",
        email="missinguser@example.com",
    )

    response = client.get(
        "/api/posts/999999",
        headers=user["headers"],
    )

    assert response.status_code == 404


def test_update_post_success(client, create_user, create_category):
    user = create_user(
        nickname="updateuser",
        email="updateuser@example.com",
    )
    headers = user["headers"]
    category_id = create_category()

    create_response = client.post(
        "/api/posts",
        headers=headers,
        json={
            "title": "수정 전 제목",
            "content": "수정 전 내용",
            "category_id": category_id,
            "status": "PUBLISHED",
            "visibility": "PUBLIC",
        },
    )
    assert create_response.status_code == 201
    post_id = create_response.json()["post_id"]

    update_response = client.patch(
        f"/api/posts/{post_id}",
        headers=headers,
        json={
            "title": "수정 후 제목",
            "content": "수정 후 내용",
        },
    )

    assert update_response.status_code == 200
    data = update_response.json()
    assert data["title"] == "수정 후 제목"
    assert data["content"] == "수정 후 내용"


def test_update_post_forbidden_for_other_user(
    client, create_user, create_category
):
    owner = create_user(
        nickname="owneruser",
        email="owneruser@example.com",
    )
    other = create_user(
        nickname="otheruser",
        email="otheruser@example.com",
    )
    category_id = create_category()

    create_response = client.post(
        "/api/posts",
        headers=owner["headers"],
        json={
            "title": "A의 게시글",
            "content": "A가 작성한 내용",
            "category_id": category_id,
            "status": "PUBLISHED",
            "visibility": "PUBLIC",
        },
    )
    assert create_response.status_code == 201
    post_id = create_response.json()["post_id"]

    response = client.patch(
        f"/api/posts/{post_id}",
        headers=other["headers"],
        json={
            "title": "B가 바꾼 제목",
            "content": "B가 바꾼 내용",
        },
    )

    assert response.status_code == 403


def test_delete_post_success(client, create_user, create_category):
    user = create_user(
        nickname="deleteuser",
        email="deleteuser@example.com",
    )
    headers = user["headers"]
    category_id = create_category()

    create_response = client.post(
        "/api/posts",
        headers=headers,
        json={
            "title": "삭제할 게시글",
            "content": "이 게시글은 삭제할 예정입니다.",
            "category_id": category_id,
            "status": "PUBLISHED",
            "visibility": "PUBLIC",
        },
    )
    assert create_response.status_code == 201
    post_id = create_response.json()["post_id"]

    like_response = client.post(
        f"/api/posts/{post_id}/likes",
        headers=headers,
    )
    assert like_response.status_code == 201

    comment_response = client.post(
        f"/api/posts/{post_id}/comments",
        headers=headers,
        json={
            "content": "게시글 삭제 cascade 테스트 댓글",
            "is_public": "PUBLIC",
        },
    )
    assert comment_response.status_code == 201

    delete_response = client.delete(
        f"/api/posts/{post_id}",
        headers=headers,
    )
    assert delete_response.status_code == 204

    db = SessionLocal()
    try:
        remaining_comments = (
            db.query(Comment)
            .filter(Comment.post_id == post_id)
            .count()
        )
        remaining_likes = (
            db.query(PostLike)
            .filter(PostLike.post_id == post_id)
            .count()
        )
    finally:
        db.close()

    assert remaining_comments == 0
    assert remaining_likes == 0

    get_response = client.get(
        f"/api/posts/{post_id}",
        headers=headers,
    )
    assert get_response.status_code == 404


def test_delete_post_forbidden_for_other_user(
    client, create_user, create_category
):
    owner = create_user(
        nickname="deleteowner",
        email="deleteowner@example.com",
    )
    other = create_user(
        nickname="deleteother",
        email="deleteother@example.com",
    )
    category_id = create_category()

    create_response = client.post(
        "/api/posts",
        headers=owner["headers"],
        json={
            "title": "A의 게시글",
            "content": "A가 작성한 게시글입니다.",
            "category_id": category_id,
            "status": "PUBLISHED",
            "visibility": "PUBLIC",
        },
    )
    assert create_response.status_code == 201
    post_id = create_response.json()["post_id"]

    response = client.delete(
        f"/api/posts/{post_id}",
        headers=other["headers"],
    )
    assert response.status_code == 403

    get_response = client.get(
        f"/api/posts/{post_id}",
        headers=owner["headers"],
    )
    assert get_response.status_code == 200


def test_search_posts_success(client, create_user, create_category):
    user = create_user(
        nickname="searchuser",
        email="searchuser@example.com",
    )
    headers = user["headers"]
    category_id = create_category()

    create_response = client.post(
        "/api/posts",
        headers=headers,
        json={
            "title": "Python 알고리즘 공부",
            "content": "자료구조와 알고리즘을 학습합니다.",
            "category_id": category_id,
            "status": "PUBLISHED",
            "visibility": "PUBLIC",
        },
    )
    assert create_response.status_code == 201

    response = client.get(
        "/api/posts/search?keyword=Python",
        headers=headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Python 알고리즘 공부"


def test_search_posts_empty_result(client, create_user):
    user = create_user(
        nickname="emptysearch",
        email="emptysearch@example.com",
    )

    response = client.get(
        "/api/posts/search?keyword=없는검색어XYZ",
        headers=user["headers"],
    )

    assert response.status_code == 200
    assert response.json() == []


def test_search_posts_excludes_private_and_draft(
    client, create_user, create_category
):
    user = create_user(
        nickname="visibilityuser",
        email="visibilityuser@example.com",
    )
    headers = user["headers"]
    category_id = create_category()

    public_response = client.post(
        "/api/posts",
        headers=headers,
        json={
            "title": "검색대상 공개 게시글",
            "content": "공개된 게시글입니다.",
            "category_id": category_id,
            "status": "PUBLISHED",
            "visibility": "PUBLIC",
        },
    )
    assert public_response.status_code == 201

    private_response = client.post(
        "/api/posts",
        headers=headers,
        json={
            "title": "검색대상 비공개 게시글",
            "content": "비공개 게시글입니다.",
            "category_id": category_id,
            "status": "PUBLISHED",
            "visibility": "PRIVATE",
        },
    )
    assert private_response.status_code == 201

    draft_response = client.post(
        "/api/posts",
        headers=headers,
        json={
            "title": "검색대상 임시저장 게시글",
            "content": "임시저장 게시글입니다.",
            "category_id": category_id,
            "status": "DRAFT",
            "visibility": "PUBLIC",
        },
    )
    assert draft_response.status_code == 201

    response = client.get(
        "/api/posts/search?keyword=검색대상",
        headers=headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "검색대상 공개 게시글"


def test_update_post_title_only(client, create_user, create_category):
    user = create_user(
        nickname="partialupdate",
        email="partialupdate@example.com",
    )
    headers = user["headers"]
    category_id = create_category()

    create_response = client.post(
        "/api/posts",
        headers=headers,
        json={
            "title": "원래 제목",
            "content": "그대로 유지할 본문",
            "category_id": category_id,
            "status": "PUBLISHED",
            "visibility": "PUBLIC",
        },
    )
    assert create_response.status_code == 201
    post_id = create_response.json()["post_id"]

    update_response = client.patch(
        f"/api/posts/{post_id}",
        headers=headers,
        json={"title": "변경된 제목"},
    )
    assert update_response.status_code == 200

    data = update_response.json()
    assert data["title"] == "변경된 제목"
    assert data["content"] == "그대로 유지할 본문"
    assert data["category_id"] == category_id


def test_update_post_category_not_found(
    client, create_user, create_category
):
    user = create_user(
        nickname="updatecategory",
        email="updatecategory@example.com",
    )
    headers = user["headers"]
    category_id = create_category()

    create_response = client.post(
        "/api/posts",
        headers=headers,
        json={
            "title": "카테고리 수정 테스트",
            "content": "원래 카테고리를 유지해야 합니다.",
            "category_id": category_id,
            "status": "PUBLISHED",
            "visibility": "PUBLIC",
        },
    )
    assert create_response.status_code == 201
    post_id = create_response.json()["post_id"]

    response = client.patch(
        f"/api/posts/{post_id}",
        headers=headers,
        json={"category_id": 999999},
    )

    assert response.status_code == 404


def test_get_posts_excludes_private_and_draft(
    client, create_user, create_category
):
    user = create_user(
        nickname="listvisibility",
        email="listvisibility@example.com",
    )
    headers = user["headers"]
    category_id = create_category()

    public_response = client.post(
        "/api/posts",
        headers=headers,
        json={
            "title": "목록 공개 게시글",
            "content": "공개된 게시글입니다.",
            "category_id": category_id,
            "status": "PUBLISHED",
            "visibility": "PUBLIC",
        },
    )
    assert public_response.status_code == 201

    private_response = client.post(
        "/api/posts",
        headers=headers,
        json={
            "title": "목록 비공개 게시글",
            "content": "비공개 게시글입니다.",
            "category_id": category_id,
            "status": "PUBLISHED",
            "visibility": "PRIVATE",
        },
    )
    assert private_response.status_code == 201

    draft_response = client.post(
        "/api/posts",
        headers=headers,
        json={
            "title": "목록 임시저장 게시글",
            "content": "임시저장 게시글입니다.",
            "category_id": category_id,
            "status": "DRAFT",
            "visibility": "PUBLIC",
        },
    )
    assert draft_response.status_code == 201

    response = client.get("/api/posts", headers=headers)

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "목록 공개 게시글"


def test_get_my_posts_includes_private_and_draft(
    client, create_user, create_category
):
    user = create_user(
        nickname="myvisibility",
        email="myvisibility@example.com",
    )
    headers = user["headers"]
    category_id = create_category()

    public_response = client.post(
        "/api/posts",
        headers=headers,
        json={
            "title": "내 공개 게시글",
            "content": "공개 게시글입니다.",
            "category_id": category_id,
            "status": "PUBLISHED",
            "visibility": "PUBLIC",
        },
    )
    assert public_response.status_code == 201

    private_response = client.post(
        "/api/posts",
        headers=headers,
        json={
            "title": "내 비공개 게시글",
            "content": "비공개 게시글입니다.",
            "category_id": category_id,
            "status": "PUBLISHED",
            "visibility": "PRIVATE",
        },
    )
    assert private_response.status_code == 201

    draft_response = client.post(
        "/api/posts",
        headers=headers,
        json={
            "title": "내 임시저장 게시글",
            "content": "임시저장 게시글입니다.",
            "category_id": category_id,
            "status": "DRAFT",
            "visibility": "PUBLIC",
        },
    )
    assert draft_response.status_code == 201

    response = client.get("/api/posts/my", headers=headers)

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3

    titles = {post["title"] for post in data}
    assert titles == {
        "내 공개 게시글",
        "내 비공개 게시글",
        "내 임시저장 게시글",
    }


def test_get_private_post_forbidden_for_other_user(
    client, create_user, create_category
):
    owner = create_user(
        nickname="privateowner",
        email="privateowner@example.com",
    )
    viewer = create_user(
        nickname="privateviewer",
        email="privateviewer@example.com",
    )
    category_id = create_category()

    create_response = client.post(
        "/api/posts",
        headers=owner["headers"],
        json={
            "title": "비공개 게시글",
            "content": "작성자만 볼 수 있습니다.",
            "category_id": category_id,
            "status": "PUBLISHED",
            "visibility": "PRIVATE",
        },
    )
    assert create_response.status_code == 201
    post_id = create_response.json()["post_id"]

    response = client.get(
        f"/api/posts/{post_id}",
        headers=viewer["headers"],
    )

    assert response.status_code == 403


def test_get_draft_post_forbidden_for_other_user(
    client, create_user, create_category
):
    owner = create_user(
        nickname="draftowner",
        email="draftowner@example.com",
    )
    viewer = create_user(
        nickname="draftviewer",
        email="draftviewer@example.com",
    )
    category_id = create_category()

    create_response = client.post(
        "/api/posts",
        headers=owner["headers"],
        json={
            "title": "임시저장 게시글",
            "content": "아직 공개하지 않은 글입니다.",
            "category_id": category_id,
            "status": "DRAFT",
            "visibility": "PUBLIC",
        },
    )
    assert create_response.status_code == 201
    post_id = create_response.json()["post_id"]

    response = client.get(
        f"/api/posts/{post_id}",
        headers=viewer["headers"],
    )

    assert response.status_code == 403



# Redis 캐시 관련 테스트
def test_get_posts_uses_redis_cache(
    client,
    create_user,
    create_category,
):
    # 테스트 사용자 생성
    user = create_user(
        nickname="cacheuser",
        email="cacheuser@example.com",
    )
    headers = user["headers"]
    category_id = create_category()

    # 공개 게시글 생성
    create_response = client.post(
        "/api/posts",
        headers=headers,
        json={
            "title": "Redis 캐시 테스트",
            "content": "캐시 재사용을 확인합니다.",
            "category_id": category_id,
            "status": "PUBLISHED",
            "visibility": "PUBLIC",
        },
    )
    assert create_response.status_code == 201

    # 첫 번째 요청: DB 조회 후 Redis 캐시 저장
    first_response = client.get(
        "/api/posts",
        headers=headers,
    )
    assert first_response.status_code == 200
    assert first_response.json()[0]["title"] == "Redis 캐시 테스트"

    # Redis에 캐시가 저장되었는지 확인
    cached_data = redis_client.get(POSTS_CACHE_KEY)
    assert cached_data is not None

    # 두 번째 요청: Redis 캐시 사용 시 DB 조회가 생략되는지 확인
    with patch(
        "app.routers.posts.query_public_posts",
        side_effect=AssertionError(
            "캐시 적중 시 게시글 DB 조회가 발생하면 안 됩니다."
        ),
    ):
        second_response = client.get(
            "/api/posts",
            headers=headers,
        )


    assert second_response.status_code == 200
    assert second_response.json() == first_response.json()


# 게시글 생성 시 캐시 무효화

def test_create_post_invalidates_redis_cache(
    client,
    create_user,
    create_category,
):
    user = create_user(
        nickname="cachecreate",
        email="cachecreate@example.com",
    )
    headers = user["headers"]
    category_id = create_category()

    # 기존 캐시 생성
    redis_client.set(POSTS_CACHE_KEY, "old_cache")

    # 게시글 생성
    response = client.post(
        "/api/posts",
        headers=headers,
        json={
            "title": "캐시 무효화 테스트",
            "content": "게시글 생성 후 캐시가 삭제되는지 확인합니다.",
            "category_id": category_id,
            "status": "PUBLISHED",
            "visibility": "PUBLIC",
        },
    )

    assert response.status_code == 201

    # 기존 캐시가 삭제되었는지 확인
    assert redis_client.get(POSTS_CACHE_KEY) is None


# 게시글 수정 시 캐시 무효화

def test_update_post_invalidates_redis_cache(
    client,
    create_user,
    create_category,
):
    user = create_user(
        nickname="cacheupdate",
        email="cacheupdate@example.com",
    )
    headers = user["headers"]
    category_id = create_category()

    # 수정할 게시글 생성
    create_response = client.post(
        "/api/posts",
        headers=headers,
        json={
            "title": "수정 전 제목",
            "content": "수정 전 내용",
            "category_id": category_id,
            "status": "PUBLISHED",
            "visibility": "PUBLIC",
        },
    )
    assert create_response.status_code == 201

    post_id = create_response.json()["post_id"]
    
    # 기존 캐시 설정
    redis_client.set(POSTS_CACHE_KEY, "old_cache")

    # 게시글 수정
    update_response = client.patch(
        f"/api/posts/{post_id}",
        headers=headers,
        json={
            "title": "수정 후 제목",
        },
    )

    assert update_response.status_code == 200
    assert update_response.json()["title"] == "수정 후 제목"

    # 기존 캐시가 삭제되었는지 확인
    assert redis_client.get(POSTS_CACHE_KEY) is None

# 게시글 삭제 시 캐시 무효화

def test_delete_post_invalidates_redis_cache(
    client,
    create_user,
    create_category,
):
    user = create_user(
        nickname="cachedelete",
        email="cachedelete@example.com",
    )
    headers = user["headers"]
    category_id = create_category()

    # 삭제할 게시글 생성
    create_response = client.post(
        "/api/posts",
        headers=headers,
        json={
            "title": "삭제할 게시글",
            "content": "삭제 후 캐시가 무효화되는지 확인합니다.",
            "category_id": category_id,
            "status": "PUBLISHED",
            "visibility": "PUBLIC",
        },
    )
    assert create_response.status_code == 201

    post_id = create_response.json()["post_id"]

    # 기존 캐시 설정
    redis_client.set(POSTS_CACHE_KEY, "old_cache")

    # 게시글 삭제
    delete_response = client.delete(
        f"/api/posts/{post_id}",
        headers=headers,
    )

    assert delete_response.status_code == 204

    # 기존 캐시가 삭제되었는지 확인
    assert redis_client.get(POSTS_CACHE_KEY) is None



# 잘못된 JSON 캐시가 있을 때 DB 조회로 복구
def test_get_posts_recovers_from_invalid_json_cache(
    client,
    create_user,
):
    user = create_user(
        nickname="cacheinvalid",
        email="cacheinvalid@example.com",
    )
    headers = user["headers"]

    # 잘못된 JSON 데이터를 Redis에 저장
    redis_client.set(POSTS_CACHE_KEY, "{invalid json")

    # 게시글 목록 조회
    with patch(
        "app.routers.posts.query_public_posts"
    ) as mock_query:
        mock_query.return_value = []

        response = client.get(
            "/api/posts",
            headers=headers,
        )

    # DB 조회 결과를 정상적으로 반환해야 한다.
    assert response.status_code == 200
    assert response.json() == []
    mock_query.assert_called_once()

    # 잘못된 캐시가 삭제되고 정상적인 캐시로 교체되었는지 확인
    cached_data = redis_client.get(POSTS_CACHE_KEY)
    assert cached_data is not None
    assert json.loads(cached_data) == []



# Redis 조회 장애 시 DB 조회로 복구
def test_get_posts_falls_back_to_db_when_redis_fails(
    client,
    create_user,
):
    from redis.exceptions import ConnectionError as RedisConnectionError

    user = create_user(
        nickname="cacheredisfail",
        email="cacheredisfail@example.com",
    )
    headers = user["headers"]

    # Redis 조회 시 연결 오류 발생
    with patch(
        "app.routers.posts.redis_client.get",
        side_effect=RedisConnectionError("Redis 연결 실패"),
    ):
        with patch(
            "app.routers.posts.query_public_posts",
            return_value=[],
        ) as mock_query:
            response = client.get(
                "/api/posts",
                headers=headers,
            )

    # Redis 장애에도 DB 조회 결과를 정상 반환해야 한다.
    assert response.status_code == 200
    assert response.json() == []
    mock_query.assert_called_once()
