from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ..auth import get_current_admin_user
from ..db import speakers_collection
from ..models import Speaker
from ..mongo_utils import as_object_id

router = APIRouter(prefix="/speakers", tags=["speakers"])


@router.get("/", response_model=List[Speaker])
async def get_speakers():
    """Obtener todos los conferencistas"""
    cursor = speakers_collection.find({})
    speakers = []
    async for speaker in cursor:
        speakers.append(Speaker(**speaker))
    return speakers


@router.get("/{speaker_id}", response_model=Speaker)
async def get_speaker(speaker_id: str):
    """Obtener un conferencista por ID"""
    speaker_doc = await speakers_collection.find_one({"_id": as_object_id(speaker_id)})
    if not speaker_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conferencista no encontrado")
    return Speaker(**speaker_doc)


@router.post("/", response_model=Speaker)
async def create_speaker(speaker: Speaker, current_user=Depends(get_current_admin_user)):
    """Crear un nuevo conferencista (solo admin)"""
    speaker_dict = speaker.dict(exclude_unset=True)
    speaker_dict.pop("_id", None)

    result = await speakers_collection.insert_one(speaker_dict)
    speaker_dict["_id"] = result.inserted_id

    return Speaker(**speaker_dict)


@router.put("/{speaker_id}", response_model=Speaker)
async def update_speaker(speaker_id: str, speaker: Speaker, current_user=Depends(get_current_admin_user)):
    """Actualizar un conferencista (solo admin)"""
    speaker_dict = speaker.dict(exclude_unset=True)
    speaker_dict.pop("_id", None)

    result = await speakers_collection.update_one(
        {"_id": as_object_id(speaker_id)},
        {"$set": speaker_dict}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conferencista no encontrado")

    return Speaker(**{**speaker_dict, "_id": speaker_id})


@router.delete("/{speaker_id}")
async def delete_speaker(speaker_id: str, current_user=Depends(get_current_admin_user)):
    """Eliminar un conferencista (solo admin)"""
    result = await speakers_collection.delete_one({"_id": as_object_id(speaker_id)})

    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conferencista no encontrado")

    return {"message": "Conferencista eliminado"}