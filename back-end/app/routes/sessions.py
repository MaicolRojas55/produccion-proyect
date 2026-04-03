from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ..auth import get_current_admin_user
from ..db import sessions_collection
from ..models import Session, DaySchedule

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("/", response_model=List[Session])
async def get_sessions():
    """Obtener todas las sesiones de la agenda"""
    cursor = sessions_collection.find({})
    sessions = []
    async for session in cursor:
        sessions.append(Session(**session))
    return sessions


@router.get("/agenda", response_model=List[DaySchedule])
async def get_agenda():
    """Obtener la agenda completa organizada por días"""
    cursor = sessions_collection.find({})
    sessions = []
    async for session in cursor:
        sessions.append(Session(**session))

    # Agrupar por fecha
    days_dict = {}
    for session in sessions:
        if session.date not in days_dict:
            # Crear etiqueta básica del día
            day_num = len(days_dict) + 1
            days_dict[session.date] = {
                "date": session.date,
                "label": f"Día {day_num}",
                "subtitle": f"Día {day_num}",
                "sessions": []
            }
        days_dict[session.date]["sessions"].append(session)

    return list(days_dict.values())


@router.post("/", response_model=Session)
async def create_session(session: Session, current_user=Depends(get_current_admin_user)):
    """Crear una nueva sesión (solo admin)"""
    session_dict = session.dict(exclude_unset=True)
    session_dict.pop("_id", None)  # Remover _id si existe

    result = await sessions_collection.insert_one(session_dict)
    session_dict["_id"] = result.inserted_id

    return Session(**session_dict)


@router.put("/{session_id}", response_model=Session)
async def update_session(session_id: str, session: Session, current_user=Depends(get_current_admin_user)):
    """Actualizar una sesión (solo admin)"""
    session_dict = session.dict(exclude_unset=True)
    session_dict.pop("_id", None)

    result = await sessions_collection.update_one(
        {"_id": session_id},
        {"$set": session_dict}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sesión no encontrada")

    return Session(**{**session_dict, "_id": session_id})


@router.delete("/{session_id}")
async def delete_session(session_id: str, current_user=Depends(get_current_admin_user)):
    """Eliminar una sesión (solo admin)"""
    result = await sessions_collection.delete_one({"_id": session_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sesión no encontrada")

    return {"message": "Sesión eliminada"}