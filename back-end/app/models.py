from datetime import datetime
from typing import Literal
from pydantic import BaseModel, EmailStr, Field


RoleType = Literal["super_admin", "web_master", "usuario_registrado"]


class User(BaseModel):
    id: str | None = Field(None, alias="_id")
    full_name: str
    email: EmailStr
    hashed_password: str
    role: RoleType = "usuario_registrado"
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: RoleType = "usuario_registrado"


class UserInDB(User):
    pass


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


class OTP(BaseModel):
    id: str | None = Field(None, alias="_id")
    email: EmailStr
    code: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    verified: bool = False

    class Config:
        allow_population_by_field_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
