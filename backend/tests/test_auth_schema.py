
import pytest
from pydantic import ValidationError

from app.schemas.auth import SignupRequest


def test_signup_request_with_valid_data():
    signup = SignupRequest(
        nickname="tester",
        email="tester@example.com",
        password="password123",
    )

    assert signup.nickname == "tester"
    assert signup.email == "tester@example.com"
    assert signup.password == "password123"


def test_signup_rejects_short_nickname():
    with pytest.raises(ValidationError):
        SignupRequest(
            nickname="a",
            email="tester@example.com",
            password="password123",
        )


def test_signup_rejects_long_nickname():
    with pytest.raises(ValidationError):
        SignupRequest(
            nickname="a" * 51,
            email="tester@example.com",
            password="password123",
        )


def test_signup_rejects_invalid_email():
    with pytest.raises(ValidationError):
        SignupRequest(
            nickname="tester",
            email="invalid-email",
            password="password123",
        )


def test_signup_rejects_short_password():
    with pytest.raises(ValidationError):
        SignupRequest(
            nickname="tester",
            email="tester@example.com",
            password="1234567",
        )


def test_signup_rejects_long_password():
    with pytest.raises(ValidationError):
        SignupRequest(
            nickname="tester",
            email="tester@example.com",
            password="a" * 129,
        )


@pytest.mark.parametrize("password", ["12345678", "a" * 128])
def test_signup_accepts_password_boundary_values(password):
    signup = SignupRequest(
        nickname="tester",
        email="tester@example.com",
        password=password,
    )

    assert signup.password == password
