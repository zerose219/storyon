def create_post(client, headers, category_id, visibility="PUBLIC"):
    response = client.post(
        "/api/posts",
        headers=headers,
        json={
            "title": "좋아요 API 테스트 게시글",
            "content": "좋아요 API 테스트용 내용입니다.",
            "category_id": category_id,
            "status": "PUBLISHED",
            "visibility": visibility,
        },
    )
    assert response.status_code == 201
    return response.json()["post_id"]


def test_like_create_count_duplicate_and_delete(
    client, create_user, create_category
):
    owner = create_user(
        nickname="likeowner",
        email="likeowner@example.com",
    )
    reader = create_user(
        nickname="likereader",
        email="likereader@example.com",
    )
    post_id = create_post(
        client,
        owner["headers"],
        create_category(),
    )
    likes_url = f"/api/posts/{post_id}/likes"

    initial_response = client.get(likes_url, headers=owner["headers"])
    assert initial_response.status_code == 200
    assert initial_response.json() == {
        "post_id": post_id,
        "like_count": 0,
        "liked": False,
    }

    create_response = client.post(likes_url, headers=reader["headers"])
    assert create_response.status_code == 201

    owner_likes = client.get(likes_url, headers=owner["headers"])
    reader_likes = client.get(likes_url, headers=reader["headers"])
    assert owner_likes.status_code == 200
    assert owner_likes.json()["like_count"] == 1
    assert owner_likes.json()["liked"] is False
    assert reader_likes.status_code == 200
    assert reader_likes.json()["like_count"] == 1
    assert reader_likes.json()["liked"] is True

    duplicate_response = client.post(likes_url, headers=reader["headers"])
    assert duplicate_response.status_code == 409

    delete_response = client.delete(likes_url, headers=reader["headers"])
    assert delete_response.status_code == 204

    final_response = client.get(likes_url, headers=owner["headers"])
    assert final_response.status_code == 200
    assert final_response.json()["like_count"] == 0
    assert final_response.json()["liked"] is False

    missing_delete = client.delete(likes_url, headers=reader["headers"])
    assert missing_delete.status_code == 404


def test_private_post_likes_are_owner_only(
    client, create_user, create_category
):
    owner = create_user(
        nickname="privatelikeowner",
        email="privatelikeowner@example.com",
    )
    reader = create_user(
        nickname="privatelikereader",
        email="privatelikereader@example.com",
    )
    post_id = create_post(
        client,
        owner["headers"],
        create_category(),
        visibility="PRIVATE",
    )
    likes_url = f"/api/posts/{post_id}/likes"

    forbidden_get = client.get(likes_url, headers=reader["headers"])
    forbidden_create = client.post(likes_url, headers=reader["headers"])

    assert forbidden_get.status_code == 403
    assert forbidden_create.status_code == 403
