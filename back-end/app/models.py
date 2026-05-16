from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

from .mongo_utils import MongoBaseModel


RoleType = Literal["super_admin", "web_master", "usuario_registrado"]
SessionType = Literal["keynote", "conference", "workshop", "panel", "networking", "break"]
AudienceType = Literal["todos", "registrados", "staff"]


class User(MongoBaseModel):
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


class UserRoleUpdate(BaseModel):
    role: RoleType


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


class OTP(MongoBaseModel):
    id: str | None = Field(None, alias="_id")
    email: EmailStr
    code: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    verified: bool = False

    class Config:
        allow_population_by_field_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class Session(MongoBaseModel):
    id: str | None = Field(None, alias="_id")
    date: str  # YYYY-MM-DD
    time: str  # HH:MM
    end_time: str  # HH:MM
    title: str
    speaker: Optional[str] = None
    speaker_role: Optional[str] = None
    location: str
    type: SessionType
    track: Optional[str] = None
    description: Optional[str] = None
    capacity: Optional[int] = None
    url: Optional[str] = None  # Para sesiones virtuales
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class DaySchedule(BaseModel):
    date: str
    label: str
    subtitle: str
    sessions: list[Session]


class Speaker(MongoBaseModel):
    id: str | None = Field(None, alias="_id")
    name: str
    role: str  # Cargo / Institución
    img: Optional[str] = None
    bio: str
    track: str = "General"
    linkedin: Optional[str] = None
    twitter: Optional[str] = None
    github: Optional[str] = None
    website: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class CalendarEvent(MongoBaseModel):
    id: str | None = Field(None, alias="_id")
    date: str  # YYYY-MM-DD
    title: str
    start_time: str  # HH:MM
    end_time: str  # HH:MM
    audience: AudienceType = "todos"
    description: Optional[str] = None
    created_by_user_id: str
    created_by_role: RoleType
    attendees: list[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class Conference(MongoBaseModel):
    id: str | None = Field(None, alias="_id")
    title: str
    location: str
    start_at: str  # ISO datetime string
    end_at: str  # ISO datetime string
    description: Optional[str] = None
    capacity: Optional[int] = None
    created_by_user_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class StudentAgendaItem(MongoBaseModel):
    id: str | None = Field(None, alias="_id")
    student_id: str
    conference_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class AgendaInscription(MongoBaseModel):
    id: str | None = Field(None, alias="_id")
    user_id: str
    session_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class Attendance(MongoBaseModel):
    id: str | None = Field(None, alias="_id")
    student_id: str
    conference_id: str
    session_id: Optional[str] = None
    qr_token: str
    checked_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
