from datetime import datetime
from typing import Literal

from pydantic import EmailStr
from sqlmodel import Field, SQLModel


class UserCreate(SQLModel):
    username: str = Field(min_length=3, max_length=50)
    full_name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)


class UserPublic(SQLModel):
    """Nunca incluye hashed_password."""

    id: int
    username: str
    full_name: str
    email: str
    role: Literal["user", "admin"]
    disabled: bool
    created_at: datetime
