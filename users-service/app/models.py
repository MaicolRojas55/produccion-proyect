from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


RoleType = Literal["super_admin", "web_master", "usuario_registrado"]


class MongoBaseModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)


class User(MongoBaseModel):
    id: str | None = Field(None, alias="_id")
    full_name: str
    email: EmailStr
    hashed_password: str
    role: RoleType = "usuario_registrado"
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UserPublic(MongoBaseModel):
    id: str | None = Field(None, alias="_id")
    full_name: str
    email: EmailStr
    role: RoleType
    is_active: bool
    is_verified: bool
    created_at: datetime


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: RoleType = "usuario_registrado"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: str | None
    email: EmailStr | None
    role: RoleType | None


class OTP(MongoBaseModel):
    id: str | None = Field(None, alias="_id")
    email: EmailStr
    code: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    verified: bool = False


class UserRegisteredEvent(BaseModel):
    event_type: Literal["user.registered"] = "user.registered"
    occurred_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: str
    email: EmailStr
    full_name: str
    role: RoleType
