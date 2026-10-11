
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from typing import List


from app.database import get_db
from app.dependencies import get_current_user
from app.models.post import Post
from app.models.user import User
from app.schemas.post import PostCreate, PostUpdate, PostResponse

router = APIRouter(
    prefix="/api/posts",
    tags=["Posts"],
)


@router.post(
    "",
    response_model=PostResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_post(
    post_data: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 게시글 작성 시 카테고리 존재 여부 확인
    from app.models.category import Category

    category = (
        db.query(Category)
        .filter(Category.category_id == post_data.category_id)
        .first()
    )

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="카테고리를 찾을 수 없습니다.",
        )

    post = Post(
        user_id=current_user.user_id,
        title=post_data.title,
        content=post_data.content,
        category_id=post_data.category_id,
        status=post_data.status,
        visibility=post_data.visibility,
    )

    db.add(post)
    db.commit()
    db.refresh(post)

    return post


# 제목 검색
@router.get("/search", response_model=list[PostResponse])
def search_posts(
    keyword: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    posts = (
        db.query(Post)
        .filter(
            Post.status == "PUBLISHED",
            Post.visibility == "PUBLIC",
            Post.title.ilike(f"%{keyword}%"),
        )
        .order_by(Post.created_at.desc())
        .all()
    )

    return posts


# 게시글 목록 조회
@router.get(
    "",
    response_model=List[PostResponse],
)
def get_posts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    posts = (
        db.query(Post)
        .filter(
            Post.visibility == "PUBLIC",
            Post.status == "PUBLISHED",
        )
        .order_by(Post.created_at.desc())
        .all()
    )

    return posts

# 내 게시글 조회
@router.get("/my", response_model=list[PostResponse])
def get_my_posts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    posts = (
        db.query(Post)
        .filter(Post.user_id == current_user.user_id)
        .order_by(Post.created_at.desc())
        .all()
    )

    return posts

# 게시글 상세조회
@router.get(
    "/{post_id}",
    response_model=PostResponse,
)
def get_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = (
        db.query(Post)
        .filter(Post.post_id == post_id)
        .first()
    )

    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="게시글을 찾을 수 없습니다.",
        )

    # 비공개 글은 작성자만 조회 가능
    if (
        post.visibility == "PRIVATE"
        and post.user_id != current_user.user_id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="이 게시글을 조회할 권한이 없습니다.",
        )

    # 임시저장 글도 작성자만 조회 가능
    if (
        post.status == "DRAFT"
        and post.user_id != current_user.user_id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="이 게시글을 조회할 권한이 없습니다.",
        )

    return post


# 게시글 수정
@router.patch(
    "/{post_id}",
    response_model=PostResponse,
)
def update_post(
    post_id: int,
    post_data: PostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = (
        db.query(Post)
        .filter(Post.post_id == post_id)
        .first()
    )

    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="게시글을 찾을 수 없습니다.",
        )

    if post.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="자신의 게시글만 수정할 수 있습니다.",
        )

    update_data = post_data.model_dump(exclude_unset=True)

    if "category_id" in update_data and update_data["category_id"] is not None:
        from app.models.category import Category

        category = (
            db.query(Category)
            .filter(Category.category_id == update_data["category_id"])
            .first()
        )

        if category is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="카테고리를 찾을 수 없습니다.",
            )

    for field, value in update_data.items():
        setattr(post, field, value)

    from datetime import datetime
    post.updated_at = datetime.now()

    db.commit()
    db.refresh(post)

    return post


# 게시글 삭제
@router.delete(
    "/{post_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = (
        db.query(Post)
        .filter(Post.post_id == post_id)
        .first()
    )

    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="게시글을 찾을 수 없습니다.",
        )

    if post.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="자신의 게시글만 삭제할 수 있습니다.",
        )

    db.delete(post)
    db.commit()

    return None



