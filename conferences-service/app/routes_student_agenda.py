from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from .auth import get_token_claims
from .db import conferences_collection, student_agenda_collection
from .models import Conference, StudentAgendaItem, TokenClaims
from .mongo_utils import as_object_id


router = APIRouter(prefix="/student-agenda", tags=["student-agenda"])


@router.get("/", response_model=List[Conference])
async def get_my_agenda(claims: TokenClaims = Depends(get_token_claims)):
    if not claims.user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    items: list[StudentAgendaItem] = []
    cursor = student_agenda_collection.find({"student_id": claims.user_id})
    async for doc in cursor:
        items.append(StudentAgendaItem(**doc))

    conferences: list[Conference] = []
    for i in items:
        conf = await conferences_collection.find_one({"_id": as_object_id(i.conference_id)})
        if conf:
            conferences.append(Conference(**conf))
    return conferences


@router.post("/{conference_id}")
async def add_to_agenda(conference_id: str, claims: TokenClaims = Depends(get_token_claims)):
    if not claims.user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    conf = await conferences_collection.find_one({"_id": as_object_id(conference_id)})
    if not conf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conferencia no encontrada")

    exists = await student_agenda_collection.find_one(
        {"student_id": claims.user_id, "conference_id": conference_id}
    )
    if exists:
        return {"message": "Ya estaba en la agenda"}

    await student_agenda_collection.insert_one(
        {"student_id": claims.user_id, "conference_id": conference_id}
    )
    return {"message": "Agregada"}


@router.delete("/{conference_id}")
async def remove_from_agenda(conference_id: str, claims: TokenClaims = Depends(get_token_claims)):
    if not claims.user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    await student_agenda_collection.delete_many(
        {"student_id": claims.user_id, "conference_id": conference_id}
    )
    return {"message": "Removida"}

