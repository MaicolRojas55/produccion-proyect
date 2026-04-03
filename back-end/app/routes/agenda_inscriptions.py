from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ..auth import get_current_active_user
from ..db import agenda_inscriptions_collection, sessions_collection
from ..models import AgendaInscription, Session, User

router = APIRouter(prefix="/agenda-inscriptions", tags=["agenda-inscriptions"])


@router.get("/", response_model=List[Session])
async def get_my_inscriptions(current_user: User = Depends(get_current_active_user)):
    """Obtener las sesiones inscritas por el usuario actual"""
    # Obtener IDs de sesiones inscritas
    cursor = agenda_inscriptions_collection.find({"user_id": current_user.id})
    session_ids = []
    async for inscription in cursor:
        session_ids.append(inscription["session_id"])

    if not session_ids:
        return []

    # Obtener las sesiones
    sessions_cursor = sessions_collection.find({"_id": {"$in": session_ids}})
    sessions = []
    async for session in sessions_cursor:
        sessions.append(Session(**session))

    return sorted(sessions, key=lambda x: (x.date, x.time))


@router.post("/{session_id}")
async def inscribe_to_session(session_id: str, current_user: User = Depends(get_current_active_user)):
    """Inscribirse a una sesión de la agenda"""
    # Verificar que la sesión existe
    session = await sessions_collection.find_one({"_id": session_id})
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sesión no encontrada")

    # Verificar que no esté ya inscrito
    existing = await agenda_inscriptions_collection.find_one({
        "user_id": current_user.id,
        "session_id": session_id
    })
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ya estás inscrito en esta sesión")

    # Verificar capacidad si está definida
    if session.get("capacity"):
        # Contar inscripciones actuales
        count = await agenda_inscriptions_collection.count_documents({"session_id": session_id})
        if count >= session["capacity"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La sesión está llena")

    # Crear inscripción
    inscription = {
        "user_id": current_user.id,
        "session_id": session_id
    }

    await agenda_inscriptions_collection.insert_one(inscription)
    return {"message": "Inscripción realizada exitosamente"}


@router.delete("/{session_id}")
async def uninscribe_from_session(session_id: str, current_user: User = Depends(get_current_active_user)):
    """Cancelar inscripción a una sesión"""
    result = await agenda_inscriptions_collection.delete_one({
        "user_id": current_user.id,
        "session_id": session_id
    })

    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No estabas inscrito en esta sesión")

    return {"message": "Inscripción cancelada"}


@router.get("/session/{session_id}/count")
async def get_session_inscription_count(session_id: str):
    """Obtener el número de inscripciones para una sesión"""
    count = await agenda_inscriptions_collection.count_documents({"session_id": session_id})
    return {"session_id": session_id, "inscriptions_count": count}