def create_post(client, headers, category_id):
    response = client.post(
        "/api/posts",
        headers=headers,
        json={
            "title": "댓글 API 테스트 게시글",
            "content": "댓글 API 테스트용 내용입니다.",
            "category_id": category_id,
            "status": "PUBLISHED",
            "visibility": "PUBLIC",
        },
    )
    assert response.status_code == 201
    return response.json()["post_id"]


def test_comment_crud_and_visibility_permissions(
    client, create_user, create_category
):
    owner = create_user(
        nickname="commentowner",
        email="commentowner@example.com",
    )
    reader = create_user(
        nickname="commentreader",
        email="commentreader@example.com",
    )
    post_id = create_post(
        client,
        owner["headers"],
        create_category(),
    )

    public_response = client.post(
        f"/api/posts/{post_id}/comments",
        headers=owner["headers"],
        json={"content": "공개 댓글", "is_public": "PUBLIC"},
    )
    private_response = client.post(
        f"/api/posts/{post_id}/comments",
        headers=owner["headers"],
        json={"content": "비공개 댓글", "is_public": "PRIVATE"},
    )

    assert public_response.status_code == 201
    assert private_response.status_code == 201
    public_comment = public_response.json()
    private_comment = private_response.json()
    assert public_comment["nickname"] == owner["nickname"]

    owner_list = client.get(
        f"/api/posts/{post_id}/comments",
        headers=owner["headers"],
    )
    reader_list = client.get(
        f"/api/posts/{post_id}/comments",
        headers=reader["headers"],
    )

    assert owner_list.status_code == 200
    assert [comment["content"] for comment in owner_list.json()] == [
        "공개 댓글",
        "비공개 댓글",
    ]
    assert reader_list.status_code == 200
    assert [comment["content"] for comment in reader_list.json()] == [
        "공개 댓글",
    ]

    unauthorized_update = client.patch(
        f"/api/posts/{post_id}/comments/{public_comment['comment_id']}",
        headers=reader["headers"],
        json={"content": "권한 없는 수정"},
    )
    assert unauthorized_update.status_code == 403

    update_response = client.patch(
        f"/api/posts/{post_id}/comments/{public_comment['comment_id']}",
        headers=owner["headers"],
        json={"content": "수정된 공개 댓글", "is_public": "PRIVATE"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["content"] == "수정된 공개 댓글"
    assert update_response.json()["is_public"] == "PRIVATE"

    reader_list_after_update = client.get(
        f"/api/posts/{post_id}/comments",
        headers=reader["headers"],
    )
    assert reader_list_after_update.status_code == 200
    assert reader_list_after_update.json() == []

    unauthorized_delete = client.delete(
        f"/api/posts/{post_id}/comments/{private_comment['comment_id']}",
        headers=reader["headers"],
    )
    assert unauthorized_delete.status_code == 403

    delete_response = client.delete(
        f"/api/posts/{post_id}/comments/{private_comment['comment_id']}",
        headers=owner["headers"],
    )
    assert delete_response.status_code == 204

    remaining_comments = client.get(
        f"/api/posts/{post_id}/comments",
        headers=owner["headers"],
    )
    assert remaining_comments.status_code == 200
    assert len(remaining_comments.json()) == 1


def test_private_post_comments_are_owner_only(
    client, create_user, create_category
):
    owner = create_user(
        nickname="privatecommentowner",
        email="privatecommentowner@example.com",
    )
    reader = create_user(
        nickname="privatecommentreader",
        email="privatecommentreader@example.com",
    )
    create_response = client.post(
        "/api/posts",
        headers=owner["headers"],
        json={
            "title": "비공개 댓글 게시글",
            "content": "작성자만 접근할 수 있습니다.",
            "category_id": create_category(),
            "status": "PUBLISHED",
            "visibility": "PRIVATE",
        },
    )
    assert create_response.status_code == 201
    post_id = create_response.json()["post_id"]

    forbidden_list = client.get(
        f"/api/posts/{post_id}/comments",
        headers=reader["headers"],
    )
    forbidden_create = client.post(
        f"/api/posts/{post_id}/comments",
        headers=reader["headers"],
        json={"content": "권한 없는 댓글", "is_public": "PUBLIC"},
    )

    assert forbidden_list.status_code == 403
    assert forbidden_create.status_code == 403
