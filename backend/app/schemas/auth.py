from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=1, max_length=128)


class SignupRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    username: str = Field(min_length=3, max_length=50)
    email: str = Field(min_length=5, max_length=120)
    password: str = Field(min_length=6, max_length=128)
    confirm_password: str = Field(min_length=6, max_length=128)
