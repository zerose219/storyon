
def test_signup_success(client):
    response = client.post(
        "/api/auth/signup",
        json={
            "nickname": "testuser",
            "email": "testuser@example.com",
            "password": "password123",
        },
    )
    print("응답 내용:", response.json())
    assert response.status_code == 201

    data = response.json()
    assert data["nickname"] == "testuser"
    assert data["email"] == "testuser@example.com"
    assert "user_id" in data
    assert "password" not in data



def test_signup_duplicate_email(client):
    payload = {
        "nickname": "user1",
        "email": "user1@example.com",
        "password": "password123",
    }

    # 첫 번째 회원가입은 성공해야 한다.
    first_response = client.post("/api/auth/signup", json=payload)
    assert first_response.status_code == 201

    # 같은 이메일로 다시 가입하면 거절해야 한다.
    second_payload = {
        "nickname": "user2",
        "email": "user1@example.com",
        "password": "password123",
    }
    second_response = client.post(
        "/api/auth/signup",
        json=second_payload,
    )

    assert second_response.status_code == 409


def test_signup_duplicate_nickname(client):
    payload = {
        "nickname": "sameuser",
        "email": "user1@example.com",
        "password": "password123",
    }

    # 첫 번째 회원가입은 성공해야 한다.
    first_response = client.post("/api/auth/signup", json=payload)
    assert first_response.status_code == 201

    # 같은 닉네임으로 다른 이메일을 사용해도 거절해야 한다.
    second_payload = {
        "nickname": "sameuser",
        "email": "user2@example.com",
        "password": "password123",
    }
    second_response = client.post(
        "/api/auth/signup",
        json=second_payload,
    )

    assert second_response.status_code == 409



def test_login_success(client):
    # 먼저 회원가입한다.
    signup_response = client.post(
        "/api/auth/signup",
        json={
            "nickname": "loginuser",
            "email": "loginuser@example.com",
            "password": "password123",
        },
    )
    assert signup_response.status_code == 201

    # 가입한 계정으로 로그인한다.
    response = client.post(
        "/api/auth/login",
        json={
            "email": "loginuser@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == 200

    data = response.json()
    assert data["email"] == "loginuser@example.com"
    assert data["nickname"] == "loginuser"
    assert data["access_token"]
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client):
    # 먼저 회원가입한다.
    signup_response = client.post(
        "/api/auth/signup",
        json={
            "nickname": "loginuser",
            "email": "loginuser@example.com",
            "password": "password123",
        },
    )
    assert signup_response.status_code == 201

    # 잘못된 비밀번호로 로그인한다.
    response = client.post(
        "/api/auth/login",
        json={
            "email": "loginuser@example.com",
            "password": "wrongpassword",
        },
    )

    assert response.status_code == 401



def test_get_my_info_success(client):
    # 1. 회원가입
    client.post(
        "/api/auth/signup",
        json={
            "nickname": "meuser",
            "email": "meuser@example.com",
            "password": "password123",
        },
    )

    # 2. 로그인해서 토큰 발급받기
    login_response = client.post(
        "/api/auth/login",
        json={
            "email": "meuser@example.com",
            "password": "password123",
        },
    )
    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    # 3. 토큰을 보내 내 정보 조회하기
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200

    data = response.json()
    assert data["nickname"] == "meuser"
    assert data["email"] == "meuser@example.com"
    assert "user_id" in data


def test_get_my_info_without_token(client):
    response = client.get("/api/auth/me")

    assert response.status_code == 401
