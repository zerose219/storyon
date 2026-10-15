from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas.auth import (
    SignupRequest,
    SignupResponse,
    LoginRequest,
    LoginResponse,
)
from app.security import (
    hash_password,
    verify_password,
    create_access_token,
)

router = APIRouter(prefix="/api/auth", tags=["인증"])


@router.post(
    "/signup",
    response_model=SignupResponse,
    status_code=status.HTTP_201_CREATED,
)
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    existing_email = db.scalar(
        select(User).where(User.email == request.email)
    )
    if existing_email:
        raise HTTPException(
            status_code=409,
            detail="이미 사용 중인 이메일입니다.",
        )

    existing_nickname = db.scalar(
        select(User).where(User.nickname == request.nickname)
    )
    if existing_nickname:
        raise HTTPException(
            status_code=409,
            detail="이미 사용 중인 닉네임입니다.",
        )

    user = User(
        nickname=request.nickname,
        email=request.email,
        password=hash_password(request.password),
        login_type="EMAIL",
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return SignupResponse(
        user_id=user.user_id,
        nickname=user.nickname,
        email=user.email,
    )


@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(
        select(User).where(User.email == request.email)
    )

    if not user or not user.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 올바르지 않습니다.",
        )

    if not verify_password(request.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 올바르지 않습니다.",
        )

    access_token = create_access_token(user.user_id)

    return LoginResponse(
        user_id=user.user_id,
        nickname=user.nickname,
        email=user.email,
        message="로그인에 성공했습니다.",
        access_token=access_token,
        token_type="bearer",
    )

@router.get("/me")
def get_my_info(
    current_user: User = Depends(get_current_user),
):
    return {
        "user_id": current_user.user_id,
        "nickname": current_user.nickname,
        "email": current_user.email,
    }