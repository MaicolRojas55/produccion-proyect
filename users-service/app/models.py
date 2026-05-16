from datetime import datetime
from typing import Literal

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


RoleType = Literal["super_admin", "web_master", "usuario_registrado"]


class MongoBaseModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    @field_validator("id", mode="before", check_fields=False)
    @classmethod
    def normalize_id(cls, value):
        return str(value) if value is not None else value


class User(MongoBaseModel):
    id: str | None = Field(None, alias="_id")
    full_name: str
    email: EmailStr
    hashed_password: str
    role: RoleType = "usuario_registrado"
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    @field_validator("id", mode="before")
    @classmethod
    def coerce_object_id(cls, v: object) -> str | None:
        if v is None:
            return None
        if isinstance(v, ObjectId):
            return str(v)
        return str(v)


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

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")
        if not any(c.isupper() for c in v):
            raise ValueError("La contraseña debe contener al menos una letra mayúscula")
        if not any(c.isdigit() for c in v):
            raise ValueError("La contraseña debe contener al menos un número")
        return v

    @field_validator("full_name")
    @classmethod
    def full_name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("El nombre no puede estar vacío")
        return v


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
