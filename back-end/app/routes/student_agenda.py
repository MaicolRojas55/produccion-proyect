from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ..auth import get_current_active_user
from ..db import student_agenda_collection, conferences_collection
from ..models import StudentAgendaItem, Conference, User

router = APIRouter(prefix="/student-agenda", tags=["student-agenda"])


@router.get("/", response_model=List[Conference])
async def get_my_agenda(current_user: User = Depends(get_current_active_user)):
    """Obtener la agenda personal del estudiante actual"""
    # Solo usuarios registrados pueden tener agenda personal
    if current_user.role != "usuario_registrado":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo estudiantes registrados pueden tener agenda personal")

    # Obtener IDs de conferencias en la agenda del estudiante
    cursor = student_agenda_collection.find({"student_id": current_user.id})
    conference_ids = []
    async for item in cursor:
        conference_ids.append(item["conference_id"])

    if not conference_ids:
        return []

    # Obtener las conferencias
    conferences_cursor = conferences_collection.find({"_id": {"$in": conference_ids}})
    conferences = []
    async for conference in conferences_cursor:
        conferences.append(Conference(**conference))

    return sorted(conferences, key=lambda x: x.start_at)


@router.post("/{conference_id}")
async def add_to_agenda(conference_id: str, current_user: User = Depends(get_current_active_user)):
    """Agregar una conferencia a la agenda personal"""
    if current_user.role != "usuario_registrado":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo estudiantes registrados pueden gestionar agenda personal")

    # Verificar que la conferencia existe
    conference = await conferences_collection.find_one({"_id": conference_id})
    if not conference:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conferencia no encontrada")

    # Verificar que no esté ya en la agenda
    existing = await student_agenda_collection.find_one({
        "student_id": current_user.id,
        "conference_id": conference_id
    })
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La conferencia ya está en tu agenda")

    # Agregar a la agenda
    agenda_item = {
        "student_id": current_user.id,
        "conference_id": conference_id
    }

    await student_agenda_collection.insert_one(agenda_item)
    return {"message": "Conferencia agregada a tu agenda"}


@router.delete("/{conference_id}")
async def remove_from_agenda(conference_id: str, current_user: User = Depends(get_current_active_user)):
    """Remover una conferencia de la agenda personal"""
    if current_user.role != "usuario_registrado":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo estudiantes registrados pueden gestionar agenda personal")

    result = await student_agenda_collection.delete_one({
        "student_id": current_user.id,
        "conference_id": conference_id
    })

    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conferencia no encontrada en tu agenda")

    return {"message": "Conferencia removida de tu agenda"}