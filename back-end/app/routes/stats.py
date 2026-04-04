from fastapi import APIRouter, Depends

from ..auth import get_current_admin_user
from ..db import (
    agenda_inscriptions_collection,
    attendance_collection,
    calendar_events_collection,
    conferences_collection,
    sessions_collection,
    speakers_collection,
    student_agenda_collection,
    users_collection,
)
from ..models import User

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/overview")
async def stats_overview(current_user: User = Depends(get_current_admin_user)):
    """Métricas agregadas para paneles Super Admin y Web Master."""
    users_total = await users_collection.count_documents({})
    super_admins = await users_collection.count_documents({"role": "super_admin"})
    web_masters = await users_collection.count_documents({"role": "web_master"})
    registered = await users_collection.count_documents({"role": "usuario_registrado"})
    verified = await users_collection.count_documents({"is_verified": True})

    conferences_count = await conferences_collection.count_documents({})
    sessions_count = await sessions_collection.count_documents({})
    speakers_count = await speakers_collection.count_documents({})
    calendar_events_count = await calendar_events_collection.count_documents({})
    student_agenda_rows = await student_agenda_collection.count_documents({})
    agenda_inscriptions_count = await agenda_inscriptions_collection.count_documents({})
    attendance_count = await attendance_collection.count_documents({})

    return {
        "users_total": users_total,
        "users_by_role": {
            "super_admin": super_admins,
            "web_master": web_masters,
            "usuario_registrado": registered,
        },
        "users_verified": verified,
        "conferences": conferences_count,
        "agenda_sessions": sessions_count,
        "speakers": speakers_count,
        "calendar_events": calendar_events_count,
        "student_agenda_items": student_agenda_rows,
        "session_inscriptions": agenda_inscriptions_count,
        "attendance_records": attendance_count,
    }
