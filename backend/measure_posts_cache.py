
import os
import time
import uuid

# 1. 테스트 DB 설정: app 관련 모듈을 import하기 전에 실행
os.environ["DATABASE_URL"] = (
    "postgresql+psycopg2://storyon_app:storyon@localhost:5433/storyon_test_db"
)

from app.main import app
from app.redis_client import redis_client, POSTS_CACHE_KEY
from fastapi.testclient import TestClient


def measure_posts_cache():
    # 2. 실행할 때마다 고유한 이메일 생성
    email = f"cachemeasure_{uuid.uuid4().hex[:8]}@example.com"
    nickname = f"cachemeasure_{uuid.uuid4().hex[:8]}"

    # 3. 테스트용 API 클라이언트 생성
    with TestClient(app) as client:
        # 회원가입
        signup_response = client.post(
            "/api/auth/signup",
            json={
                "nickname": nickname,
                "email": email,
                "password": "password123",
            },
        )

        if signup_response.status_code not in (200, 201):
            print("회원가입 응답:", signup_response.status_code)
            print(signup_response.text)
            return

        # 로그인
        login_response = client.post(
            "/api/auth/login",
            json={
                "email": email,
                "password": "password123",
            },
        )

        if login_response.status_code != 200:
            print("로그인 응답:", login_response.status_code)
            print(login_response.text)
            return

        headers = {
            "Authorization": (
                f"Bearer {login_response.json()['access_token']}"
            )
        }

        try:
            # 4. 기존 캐시 제거
            # 첫 번째 요청에서 DB 조회가 발생하도록 준비
            redis_client.delete(POSTS_CACHE_KEY)

            # 5. 첫 번째 요청 측정: 캐시 미스
            start = time.perf_counter()

            first_response = client.get(
                "/api/posts",
                headers=headers,
            )

            first_time = time.perf_counter() - start

            if first_response.status_code != 200:
                print("첫 요청 실패:", first_response.status_code)
                print(first_response.text)
                return

            # 6. 두 번째 요청 측정: 캐시 히트 예상
            start = time.perf_counter()

            second_response = client.get(
                "/api/posts",
                headers=headers,
            )

            second_time = time.perf_counter() - start

            if second_response.status_code != 200:
                print("두 번째 요청 실패:", second_response.status_code)
                print(second_response.text)
                return

            # 7. 결과 출력
            from app.database import engine
            print(f"측정 DB: {engine.url.database}")
            print(f"첫 번째 요청: {first_time * 1000:.2f} ms")
            print(f"두 번째 요청: {second_time * 1000:.2f} ms")
            print(
                "응답 데이터 일치:",
                first_response.json() == second_response.json(),
            )

            if first_time > 0:
                reduction = (first_time - second_time) / first_time * 100
                print(f"응답시간 변화율: {reduction:.1f}% 감소")

        finally:
            # 8. 측정용 캐시 정리
            redis_client.delete(POSTS_CACHE_KEY)


if __name__ == "__main__":
    measure_posts_cache()
