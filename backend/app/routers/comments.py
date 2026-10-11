from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.comment import Comment
from app.models.post import Post
from app.models.user import User
from app.schemas.comment import (
    CommentCreate,
    CommentUpdate,
    CommentResponse,
)


router = APIRouter(
    prefix="/api/posts/{post_id}/comments",
    tags=["댓글"],
)


@router.get("", response_model=list[CommentResponse])
def get_comments(
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

    query = (
        db.query(Comment)
        .options(joinedload(Comment.user))
        .filter(Comment.post_id == post_id)
    )

    # 게시글 작성자가 아닌 사용자는 공개 댓글만 조회할 수 있다.
    if post.user_id != current_user.user_id:
        query = query.filter(Comment.is_public == "PUBLIC")

    comments = query.order_by(
        Comment.created_at.asc(),
        Comment.comment_id.asc(),
    ).all()

    return [
        {
            "comment_id": comment.comment_id,
            "post_id": comment.post_id,
            "user_id": comment.user_id,
            "content": comment.content,
            "is_public": comment.is_public,
            "created_at": comment.created_at,
            "updated_at": comment.updated_at,
            "nickname": comment.user.nickname,
        }
        for comment in comments
    ]


@router.post(
    "",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_comment(
    post_id: int,
    request: CommentCreate,
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

    # 비공개 게시글은 작성자만 댓글을 작성할 수 있다.
    if (
        post.visibility == "PRIVATE"
        and post.user_id != current_user.user_id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="비공개 게시글에는 댓글을 작성할 수 없습니다.",
        )

    comment = Comment(
        post_id=post_id,
        user_id=current_user.user_id,
        content=request.content,
        is_public=request.is_public,
    )

    db.add(comment)
    db.commit()
    db.refresh(comment)

    return {
        "comment_id": comment.comment_id,
        "post_id": comment.post_id,
        "user_id": comment.user_id,
        "content": comment.content,
        "is_public": comment.is_public,
        "created_at": comment.created_at,
        "updated_at": comment.updated_at,
        "nickname": current_user.nickname,
    }


@router.patch(
    "/{comment_id}",
    response_model=CommentResponse,
)
def update_comment(
    post_id: int,
    comment_id: int,
    request: CommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comment = (
        db.query(Comment)
        .options(joinedload(Comment.user))
        .filter(
            Comment.comment_id == comment_id,
            Comment.post_id == post_id,
        )
        .first()
    )

    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="댓글을 찾을 수 없습니다.",
        )

    if comment.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="본인이 작성한 댓글만 수정할 수 있습니다.",
        )

    update_data = request.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(comment, field, value)

    if update_data:
        # DB의 DateTime 컬럼이 시간대를 지정하지 않는 형식이므로
        # 현재 로컬 시간이 아닌 UTC 기준의 시간대를 제거한 값을 저장한다.
        comment.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(comment)

    return {
        "comment_id": comment.comment_id,
        "post_id": comment.post_id,
        "user_id": comment.user_id,
        "content": comment.content,
        "is_public": comment.is_public,
        "created_at": comment.created_at,
        "updated_at": comment.updated_at,
        "nickname": comment.user.nickname,
    }


@router.delete(
    "/{comment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_comment(
    post_id: int,
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comment = db.query(Comment).filter(
        Comment.comment_id == comment_id,
        Comment.post_id == post_id,
    ).first()

    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="댓글을 찾을 수 없습니다.",
        )

    if comment.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="본인이 작성한 댓글만 삭제할 수 있습니다.",
        )

    db.delete(comment)
    db.commit()

    return None