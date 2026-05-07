from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


RoleType = Literal["super_admin", "web_master", "usuario_registrado"]


class MongoBaseModel(BaseModel):
    class Config:
        populate_by_name = True

    @field_validator("id", mode="before", check_fields=False)
    @classmethod
    def normalize_id(cls, value):
        return str(value) if value is not None else value


class Conference(MongoBaseModel):
    id: str | None = Field(None, alias="_id")
    title: str
    description: Optional[str] = None
    start_at: str
    end_at: str
    location: Optional[str] = None
    capacity: Optional[int] = None
    created_by_user_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class StudentAgendaItem(MongoBaseModel):
    id: str | None = Field(None, alias="_id")
    student_id: str
    conference_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class TokenClaims(BaseModel):
    sub: EmailStr | None = None
    user_id: str | None = None
    role: RoleType | None = None


class ConferenceCreatedEvent(BaseModel):
    event_type: Literal["conference.created"] = "conference.created"
    occurred_at: datetime = Field(default_factory=datetime.utcnow)
    conference_id: str
    title: str
    created_by_user_id: str | None

