from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.post import Post
from app.models.post_like import PostLike
from app.models.user import User


router = APIRouter(
    prefix="/api/posts/{post_id}/likes",
    tags=["좋아요"],
)


@router.get("")
def get_post_likes(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = db.query(Post).filter(
        Post.post_id == post_id
    ).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="게시글을 찾을 수 없습니다.",
        )

    # 비공개 게시글은 작성자만 조회할 수 있다.
    if (
        post.visibility == "PRIVATE"
        and post.user_id != current_user.user_id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="비공개 게시글을 조회할 수 없습니다.",
        )

    like_count = (
        db.query(func.count(PostLike.user_id))
        .filter(PostLike.post_id == post_id)
        .scalar()
    )

    liked = (
        db.query(PostLike)
        .filter(
            PostLike.post_id == post_id,
            PostLike.user_id == current_user.user_id,
        )
        .first()
        is not None
    )

    return {
        "post_id": post_id,
        "like_count": like_count or 0,
        "liked": liked,
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def create_post_like(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = db.query(Post).filter(
        Post.post_id == post_id
    ).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="게시글을 찾을 수 없습니다.",
        )

    if (
        post.visibility == "PRIVATE"
        and post.user_id != current_user.user_id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="비공개 게시글에는 좋아요를 등록할 수 없습니다.",
        )

    existing_like = db.query(PostLike).filter(
        PostLike.post_id == post_id,
        PostLike.user_id == current_user.user_id,
    ).first()

    if existing_like:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="이미 좋아요를 등록했습니다.",
        )

    like = PostLike(
        post_id=post_id,
        user_id=current_user.user_id,
    )

    db.add(like)
    db.commit()

    return {
        "message": "좋아요를 등록했습니다.",
        "post_id": post_id,
    }


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def delete_post_like(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    like = db.query(PostLike).filter(
        PostLike.post_id == post_id,
        PostLike.user_id == current_user.user_id,
    ).first()

    if not like:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="등록된 좋아요가 없습니다.",
        )

    db.delete(like)
    db.commit()

    return None