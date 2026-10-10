from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    nickname: str = Field(min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class SignupResponse(BaseModel):
    user_id: int
    nickname: str
    email: EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginResponse(BaseModel):
    user_id: int
    nickname: str
    email: EmailStr
    message: str