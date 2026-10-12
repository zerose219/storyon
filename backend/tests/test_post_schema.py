
import pytest
from pydantic import ValidationError

from app.schemas.post import PostCreate, PostUpdate


def test_post_create_with_valid_data():
    post = PostCreate(
        title="Python 공부",
        content="리스트와 딕셔너리를 공부했다.",
        category_id=1,
        status="PUBLISHED",
        visibility="PUBLIC",
    )

    assert post.title == "Python 공부"
    assert post.category_id == 1
    assert post.status == "PUBLISHED"
    assert post.visibility == "PUBLIC"


def test_post_create_default_values():
    post = PostCreate(
        title="테스트 게시글",
        content="게시글 내용",
        category_id=1,
    )

    assert post.status == "DRAFT"
    assert post.visibility == "PUBLIC"


def test_post_create_rejects_empty_title():
    with pytest.raises(ValidationError):
        PostCreate(
            title="",
            content="게시글 내용",
            category_id=1,
        )


def test_post_create_rejects_invalid_status():
    with pytest.raises(ValidationError):
        PostCreate(
            title="테스트 게시글",
            content="게시글 내용",
            category_id=1,
            status="WAITING",
        )


def test_post_create_rejects_invalid_category_id():
    with pytest.raises(ValidationError):
        PostCreate(
            title="테스트 게시글",
            content="게시글 내용",
            category_id=0,
        )


def test_post_update_allows_partial_update():
    post = PostUpdate(title="수정된 제목")

    assert post.title == "수정된 제목"
    assert post.content is None
    assert post.category_id is None


def test_post_update_rejects_empty_title():
    with pytest.raises(ValidationError):
        PostUpdate(title="")


def test_post_update_rejects_invalid_status():
    with pytest.raises(ValidationError):
        PostUpdate(status="WAITING")


def test_post_update_rejects_invalid_visibility():
    with pytest.raises(ValidationError):
        PostUpdate(visibility="HIDDEN")


def test_post_update_rejects_invalid_category_id():
    with pytest.raises(ValidationError):
        PostUpdate(category_id=0)
