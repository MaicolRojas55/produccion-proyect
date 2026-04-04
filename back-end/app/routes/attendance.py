from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime, timedelta
from ..auth import get_current_active_user
from ..db import attendance_collection, conferences_collection, sessions_collection
from ..models import Attendance, Conference, Session, User
from ..mongo_utils import as_object_id
import secrets

router = APIRouter(prefix="/attendance", tags=["attendance"])


def generate_qr_token() -> str:
    """Generar un token QR único"""
    return secrets.token_urlsafe(32)


@router.get("/", response_model=List[Attendance])
async def get_my_attendance(current_user: User = Depends(get_current_active_user)):
    """Obtener el registro de asistencia del usuario actual"""
    if current_user.role != "usuario_registrado":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo estudiantes pueden ver su asistencia")

    cursor = attendance_collection.find({"student_id": current_user.id})
    attendance = []
    async for record in cursor:
        attendance.append(Attendance(**record))
    return sorted(attendance, key=lambda x: x.checked_at, reverse=True)


@router.post("/conference/{conference_id}")
async def check_attendance_conference(conference_id: str, current_user: User = Depends(get_current_active_user)):
    """Registrar asistencia a una conferencia usando QR"""
    if current_user.role != "usuario_registrado":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo estudiantes pueden registrar asistencia")

    # Verificar que la conferencia existe
    conference = await conferences_collection.find_one({"_id": as_object_id(conference_id)})
    if not conference:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conferencia no encontrada")

    # Verificar que esté en la agenda del estudiante
    # (Aquí podríamos agregar validación adicional si es necesario)

    # Verificar que no haya registrado asistencia ya
    existing = await attendance_collection.find_one({
        "student_id": current_user.id,
        "conference_id": conference_id
    })
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ya registraste asistencia a esta conferencia")

    # Generar token QR y registrar asistencia
    qr_token = generate_qr_token()
    attendance_record = {
        "student_id": current_user.id,
        "conference_id": conference_id,
        "qr_token": qr_token
    }

    await attendance_collection.insert_one(attendance_record)
    return {
        "message": "Asistencia registrada",
        "qr_token": qr_token
    }


@router.post("/session/{session_id}")
async def check_attendance_session(session_id: str, current_user: User = Depends(get_current_active_user)):
    """Registrar asistencia a una sesión usando QR"""
    if current_user.role != "usuario_registrado":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo estudiantes pueden registrar asistencia")

    # Verificar que la sesión existe
    session = await sessions_collection.find_one({"_id": as_object_id(session_id)})
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sesión no encontrada")

    # Verificar que esté inscrito en la sesión
    # (Podríamos agregar esta validación si es necesaria)

    # Verificar que no haya registrado asistencia ya
    existing = await attendance_collection.find_one({
        "student_id": current_user.id,
        "session_id": session_id
    })
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ya registraste asistencia a esta sesión")

    # Generar token QR y registrar asistencia
    qr_token = generate_qr_token()
    attendance_record = {
        "student_id": current_user.id,
        "conference_id": session_id,  # Para sesiones, usamos el session_id como conference_id
        "session_id": session_id,
        "qr_token": qr_token
    }

    await attendance_collection.insert_one(attendance_record)
    return {
        "message": "Asistencia registrada",
        "qr_token": qr_token
    }


@router.get("/qr/{qr_token}")
async def validate_qr_token(qr_token: str):
    """Validar un token QR (para check-in por parte del staff)"""
    attendance_record = await attendance_collection.find_one({"qr_token": qr_token})
    if not attendance_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Token QR inválido")

    # Aquí podríamos agregar lógica adicional como verificar tiempo de validez, etc.

    return {
        "valid": True,
        "student_id": attendance_record["student_id"],
        "conference_id": attendance_record.get("conference_id"),
        "session_id": attendance_record.get("session_id"),
        "checked_at": attendance_record["checked_at"]
    }


@router.get("/conference/{conference_id}/attendees")
async def get_conference_attendees(conference_id: str, current_user: User = Depends(get_current_active_user)):
    """Obtener lista de asistentes a una conferencia (solo staff)"""
    if current_user.role not in ["super_admin", "web_master"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo el staff puede ver la lista de asistentes")

    cursor = attendance_collection.find({"conference_id": conference_id})
    attendees = []
    async for record in cursor:
        attendees.append({
            "student_id": record["student_id"],
            "checked_at": record["checked_at"]
        })

    return {"conference_id": conference_id, "attendees": attendees}