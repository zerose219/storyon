
from app.security import hash_password, verify_password


def test_hash_password_does_not_return_plain_password():
    password = "password123"

    hashed_password = hash_password(password)

    assert hashed_password != password


def test_verify_password_with_correct_password():
    password = "password123"
    hashed_password = hash_password(password)

    assert verify_password(password, hashed_password) is True


def test_verify_password_with_wrong_password():
    password = "password123"
    hashed_password = hash_password(password)

    assert verify_password("wrongpassword", hashed_password) is False



# JWT

import jwt

from app.config import JWT_SECRET_KEY, JWT_ALGORITHM
from app.security import create_access_token


def test_create_access_token_returns_string():
    token = create_access_token(user_id=1)

    assert isinstance(token, str)
    assert len(token) > 0


def test_access_token_contains_user_id():
    token = create_access_token(user_id=123)

    payload = jwt.decode(
        token,
        JWT_SECRET_KEY,
        algorithms=[JWT_ALGORITHM],
    )

    assert payload["sub"] == "123"


def test_access_token_contains_expiration():
    token = create_access_token(user_id=1)

    payload = jwt.decode(
        token,
        JWT_SECRET_KEY,
        algorithms=[JWT_ALGORITHM],
    )

    assert "exp" in payload
