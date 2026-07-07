"""Auth request and response schemas."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.core.permissions import Role


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=256)
    role: Role = Role.BUYER

    @field_validator("role")
    @classmethod
    def public_roles_only(cls, value: Role) -> Role:
        if value is Role.ADMIN:
            raise ValueError("admin registration is not allowed")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=256)


class RefreshRequest(BaseModel):
    refresh_token: str = Field(min_length=32)


class LogoutRequest(BaseModel):
    refresh_token: str | None = Field(default=None, min_length=32)


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: EmailStr
    roles: list[Role]
    is_active: bool
    email_verified: bool
    created_at: datetime

