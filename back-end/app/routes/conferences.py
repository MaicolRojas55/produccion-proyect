from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ..auth import get_current_active_user, get_current_admin_user
from ..db import conferences_collection
from ..models import Conference, User

router = APIRouter(prefix="/conferences", tags=["conferences"])


@router.get("/", response_model=List[Conference])
async def get_conferences():
    """Obtener todas las conferencias"""
    cursor = conferences_collection.find({})
    conferences = []
    async for conference in cursor:
        conferences.append(Conference(**conference))
    return sorted(conferences, key=lambda x: x.start_at)


@router.get("/{conference_id}", response_model=Conference)
async def get_conference(conference_id: str):
    """Obtener una conferencia específica"""
    conference_doc = await conferences_collection.find_one({"_id": conference_id})
    if not conference_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conferencia no encontrada")
    return Conference(**conference_doc)


@router.post("/", response_model=Conference)
async def create_conference(conference: Conference, current_user: User = Depends(get_current_active_user)):
    """Crear una nueva conferencia"""
    # Solo staff puede crear conferencias
    if current_user.role not in ["super_admin", "web_master"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo el staff puede crear conferencias")

    conference_dict = conference.dict(exclude_unset=True)
    conference_dict.pop("_id", None)
    conference_dict["created_by_user_id"] = current_user.id

    result = await conferences_collection.insert_one(conference_dict)
    conference_dict["_id"] = result.inserted_id

    return Conference(**conference_dict)


@router.put("/{conference_id}", response_model=Conference)
async def update_conference(conference_id: str, conference: Conference, current_user: User = Depends(get_current_active_user)):
    """Actualizar una conferencia"""
    # Verificar que el usuario creó la conferencia o es admin
    existing_conference = await conferences_collection.find_one({"_id": conference_id})
    if not existing_conference:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conferencia no encontrada")

    if existing_conference["created_by_user_id"] != current_user.id and current_user.role not in ["super_admin", "web_master"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permisos para editar esta conferencia")

    conference_dict = conference.dict(exclude_unset=True)
    conference_dict.pop("_id", None)

    result = await conferences_collection.update_one(
        {"_id": conference_id},
        {"$set": conference_dict}
    )

    return Conference(**{**conference_dict, "_id": conference_id})


@router.delete("/{conference_id}")
async def delete_conference(conference_id: str, current_user: User = Depends(get_current_active_user)):
    """Eliminar una conferencia"""
    # Verificar que el usuario creó la conferencia o es admin
    existing_conference = await conferences_collection.find_one({"_id": conference_id})
    if not existing_conference:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conferencia no encontrada")

    if existing_conference["created_by_user_id"] != current_user.id and current_user.role not in ["super_admin", "web_master"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permisos para eliminar esta conferencia")

    result = await conferences_collection.delete_one({"_id": conference_id})
    return {"message": "Conferencia eliminada"}