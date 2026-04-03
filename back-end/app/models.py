from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, EmailStr, Field


RoleType = Literal["super_admin", "web_master", "usuario_registrado"]
SessionType = Literal["keynote", "conference", "workshop", "panel", "networking", "break"]
AudienceType = Literal["todos", "registrados", "staff"]


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


class Session(BaseModel):
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


class Speaker(BaseModel):
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


class CalendarEvent(BaseModel):
    id: str | None = Field(None, alias="_id")
    date: str  # YYYY-MM-DD
    title: str
    start_time: str  # HH:MM
    end_time: str  # HH:MM
    audience: AudienceType = "todos"
    description: Optional[str] = None
    created_by_user_id: str
    created_by_role: RoleType
    attendees: list[str] = []  # Lista de user_ids
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class Conference(BaseModel):
    id: str | None = Field(None, alias="_id")
    title: str
    location: str
    start_at: str  # ISO datetime string
    end_at: str  # ISO datetime string
    description: Optional[str] = None
    capacity: Optional[int] = None
    created_by_user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class StudentAgendaItem(BaseModel):
    id: str | None = Field(None, alias="_id")
    student_id: str
    conference_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class AgendaInscription(BaseModel):
    id: str | None = Field(None, alias="_id")
    user_id: str
    session_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class Attendance(BaseModel):
    id: str | None = Field(None, alias="_id")
    student_id: str
    conference_id: str
    session_id: Optional[str] = None
    qr_token: str
    checked_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
