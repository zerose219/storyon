
from sqlalchemy import select

from app.database import SessionLocal
from app.models.category import Category
from app.models.user import User
from app.models.post import Post
from app.models.comment import Comment
from app.models.post_like import PostLike
from app.security import hash_password


INITIAL_CATEGORIES = [
    "Python",
    "Backend",
    "Frontend",
    "Database",
    "DevOps",
    "Network",
    "Algorithm",
    "Etc",
]

SEED_USERS = [
    {
        "nickname": "seed_user_01",
        "email": "seed_user_01@example.com",
        "password": "StoryOnDev123!",
        "login_type": "EMAIL",
    },
    {
        "nickname": "seed_user_02",
        "email": "seed_user_02@example.com",
        "password": "StoryOnDev123!",
        "login_type": "EMAIL",
    },
    {
        "nickname": "seed_user_03",
        "email": "seed_user_03@example.com",
        "password": "StoryOnDev123!",
        "login_type": "EMAIL",
    },
]

SEED_POSTS = [
    {
        "title": "Python 리스트와 튜플 정리",
        "content": "리스트는 변경 가능하고 튜플은 변경할 수 없는 시퀀스 자료형이다.",
        "category": "Python",
        "user": "seed_user_01",
    },
    {
        "title": "Python 딕셔너리 활용",
        "content": "딕셔너리는 키와 값으로 데이터를 관리한다.",
        "category": "Python",
        "user": "seed_user_02",
    },
    {
        "title": "FastAPI 프로젝트 구조",
        "content": "라우터, 스키마, 모델, 서비스 계층을 분리하면 유지보수에 도움이 된다.",
        "category": "Backend",
        "user": "seed_user_01",
    },
    {
        "title": "REST API 설계 원칙",
        "content": "HTTP 메서드와 상태 코드를 목적에 맞게 사용한다.",
        "category": "Backend",
        "user": "seed_user_03",
    },
    {
        "title": "React 상태 관리 기초",
        "content": "useState와 useEffect의 역할을 구분해 사용한다.",
        "category": "Frontend",
        "user": "seed_user_02",
    },
    {
        "title": "TypeScript 타입 정의",
        "content": "타입을 명시하면 개발 중 오류를 더 일찍 발견할 수 있다.",
        "category": "Frontend",
        "user": "seed_user_03",
    },
    {
        "title": "PostgreSQL 외래 키",
        "content": "외래 키는 테이블 간 참조 무결성을 보장한다.",
        "category": "Database",
        "user": "seed_user_01",
    },
    {
        "title": "Redis 캐시 기본 개념",
        "content": "자주 조회하는 데이터를 캐시에 저장하면 반복 조회 비용을 줄일 수 있다.",
        "category": "DevOps",
        "user": "seed_user_02",
    },
    {
        "title": "HTTP와 HTTPS 차이",
        "content": "HTTPS는 TLS를 이용해 통신 내용을 보호한다.",
        "category": "Network",
        "user": "seed_user_03",
    },
    {
        "title": "코딩 테스트 시간 복잡도",
        "content": "입력 크기에 따라 알고리즘의 실행 시간이 어떻게 증가하는지 분석한다.",
        "category": "Algorithm",
        "user": "seed_user_01",
    },
]

SEED_COMMENTS = [
    {
        "post_title": "Python 리스트와 튜플 정리",
        "user": "seed_user_02",
        "content": "차이점을 예시로 정리하니 이해하기 쉽네요.",
        "is_public": "PUBLIC",
    },
    {
        "post_title": "Python 리스트와 튜플 정리",
        "user": "seed_user_03",
        "content": "불변 자료형의 특징도 중요하겠어요.",
        "is_public": "PUBLIC",
    },
    {
        "post_title": "Python 딕셔너리 활용",
        "user": "seed_user_01",
        "content": "키를 이용한 조회가 편리하네요.",
        "is_public": "PUBLIC",
    },
    {
        "post_title": "FastAPI 프로젝트 구조",
        "user": "seed_user_02",
        "content": "라우터와 스키마를 분리하는 방식이 좋네요.",
        "is_public": "PUBLIC",
    },
    {
        "post_title": "FastAPI 프로젝트 구조",
        "user": "seed_user_03",
        "content": "서비스 계층도 추가로 공부해 보겠습니다.",
        "is_public": "PUBLIC",
    },
    {
        "post_title": "REST API 설계 원칙",
        "user": "seed_user_01",
        "content": "상태 코드의 의미를 명확히 알아야겠어요.",
        "is_public": "PUBLIC",
    },
    {
        "post_title": "React 상태 관리 기초",
        "user": "seed_user_01",
        "content": "렌더링과 상태 변경의 관계가 중요하네요.",
        "is_public": "PUBLIC",
    },
    {
        "post_title": "TypeScript 타입 정의",
        "user": "seed_user_02",
        "content": "API 응답 타입도 정의하면 도움이 되겠어요.",
        "is_public": "PUBLIC",
    },
    {
        "post_title": "PostgreSQL 외래 키",
        "user": "seed_user_03",
        "content": "참조 무결성에 대해 복습했습니다.",
        "is_public": "PUBLIC",
    },
    {
        "post_title": "Redis 캐시 기본 개념",
        "user": "seed_user_01",
        "content": "캐시 무효화 전략도 궁금하네요.",
        "is_public": "PUBLIC",
    },
    {
        "post_title": "HTTP와 HTTPS 차이",
        "user": "seed_user_02",
        "content": "TLS가 어떤 역할을 하는지 더 공부해 보겠습니다.",
        "is_public": "PUBLIC",
    },
    {
        "post_title": "코딩 테스트 시간 복잡도",
        "user": "seed_user_02",
        "content": "빅오 표기법을 연습해야겠어요.",
        "is_public": "PUBLIC",
    },
    {
        "post_title": "코딩 테스트 시간 복잡도",
        "user": "seed_user_03",
        "content": "입력 크기에 따른 차이를 비교해 보면 좋겠네요.",
        "is_public": "PUBLIC",
    },
    {
        "post_title": "Redis 캐시 기본 개념",
        "user": "seed_user_03",
        "content": "DB 조회 횟수를 줄이는 데 활용할 수 있겠어요.",
        "is_public": "PUBLIC",
    },
    {
        "post_title": "PostgreSQL 외래 키",
        "user": "seed_user_02",
        "content": "CASCADE와 RESTRICT의 차이도 확인해 봐야겠어요.",
        "is_public": "PRIVATE",
    },
]

SEED_LIKES = [
    ("Python 리스트와 튜플 정리", "seed_user_02"),
    ("Python 딕셔너리 활용", "seed_user_01"),
    ("FastAPI 프로젝트 구조", "seed_user_02"),
    ("REST API 설계 원칙", "seed_user_01"),
    ("React 상태 관리 기초", "seed_user_03"),
    ("TypeScript 타입 정의", "seed_user_02"),
    ("PostgreSQL 외래 키", "seed_user_03"),
    ("Redis 캐시 기본 개념", "seed_user_01"),
    ("HTTP와 HTTPS 차이", "seed_user_02"),
    ("코딩 테스트 시간 복잡도", "seed_user_03"),
]


def seed() -> None:
    with SessionLocal() as db:
        try:
            # 1. 카테고리
            categories = {
                category.category_name: category
                for category in db.scalars(select(Category)).all()
            }

            for name in INITIAL_CATEGORIES:
                if name not in categories:
                    category = Category(category_name=name)
                    db.add(category)
                    categories[name] = category

            db.flush()

            # 2. 개발용 사용자
            users = {
                user.nickname: user
                for user in db.scalars(select(User)).all()
                if user.nickname.startswith("seed_user_")
            }

            for data in SEED_USERS:
                if data["nickname"] not in users:
                    existing_email = db.scalar(
                        select(User).where(User.email == data["email"])
                    )
                    if existing_email is not None:
                        raise ValueError(
                            f"Seed 이메일이 다른 사용자에게 사용 중입니다: {data['email']}"
                        )

                    user = User(
                        nickname=data["nickname"],
                        email=data["email"],
                        password=hash_password(data["password"]),
                        login_type=data["login_type"],
                    )
                    db.add(user)
                    users[data["nickname"]] = user

            db.flush()

            # 3. 게시글
            posts = {
                post.title: post
                for post in db.scalars(select(Post)).all()
                if post.title in {data["title"] for data in SEED_POSTS}
                and post.user.nickname.startswith("seed_user_")
            }

            for data in SEED_POSTS:
                if data["title"] not in posts:
                    post = Post(
                        user_id=users[data["user"]].user_id,
                        title=data["title"],
                        content=data["content"],
                        category_id=categories[data["category"]].category_id,
                        status="PUBLISHED",
                        visibility="PUBLIC",
                    )
                    db.add(post)
                    posts[data["title"]] = post

            db.flush()

            # 4. 댓글
            existing_comments = {
                (comment.post_id, comment.user_id, comment.content)
                for comment in db.scalars(select(Comment)).all()
            }

            for data in SEED_COMMENTS:
                post = posts[data["post_title"]]
                user = users[data["user"]]
                key = (post.post_id, user.user_id, data["content"])

                if key not in existing_comments:
                    db.add(
                        Comment(
                            post_id=post.post_id,
                            user_id=user.user_id,
                            content=data["content"],
                            is_public=data["is_public"],
                        )
                    )
                    existing_comments.add(key)

            # 5. 좋아요
            existing_likes = {
                (like.post_id, like.user_id)
                for like in db.scalars(select(PostLike)).all()
            }

            for post_title, nickname in SEED_LIKES:
                post = posts[post_title]
                user = users[nickname]
                key = (post.post_id, user.user_id)

                if key not in existing_likes:
                    db.add(PostLike(post_id=post.post_id, user_id=user.user_id))
                    existing_likes.add(key)

            db.commit()
            print("StoryOn Seed 완료: 카테고리, 사용자, 게시글, 댓글, 좋아요")

        except Exception:
            db.rollback()
            raise


if __name__ == "__main__":
    seed()
