from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.routers.auth import router as auth_router
from app.routers.posts import router as posts_router
from app.routers.categories import router as categories_router

app = FastAPI(title="StoryOn API")


# 프론트엔드 요청 허용 (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 인증 API 등록
app.include_router(auth_router)
app.include_router(posts_router)
app.include_router(categories_router)


# 서버 상태 확인
@app.get("/health")
def health_check():
    return {"status": "ok"}


# 데이터베이스 연결 확인
@app.get("/health/db")
def health_check_db(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}