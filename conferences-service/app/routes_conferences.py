from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from .auth import require_staff, get_token_claims
from .db import conferences_collection, student_agenda_collection
from .events import publish_event
from .models import Conference, TokenClaims
from .mongo_utils import as_object_id


router = APIRouter(prefix="/conferences", tags=["conferences"])


@router.get("/", response_model=List[Conference])
async def get_conferences():
    cursor = conferences_collection.find({})
    raw: list[dict] = []
    async for conference in cursor:
        raw.append(conference)

    id_to_count: dict[str, int] = {}
    agg = student_agenda_collection.aggregate(
        [{"$group": {"_id": "$conference_id", "n": {"$sum": 1}}}]
    )
    async for doc in agg:
        cid = doc.get("_id")
        if cid:
            id_to_count[str(cid)] = int(doc.get("n") or 0)

    conferences: list[Conference] = []
    for doc in raw:
        cid = str(doc["_id"])
        merged = {
            **doc,
            "enrollment_count": id_to_count.get(cid, 0),
        }
        conferences.append(Conference(**merged))
    return sorted(conferences, key=lambda x: x.start_at)


@router.get("/{conference_id}", response_model=Conference)
async def get_conference(conference_id: str):
    conference_doc = await conferences_collection.find_one(
        {"_id": as_object_id(conference_id)}
    )
    if not conference_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Conferencia no encontrada"
        )
    n = await student_agenda_collection.count_documents(
        {"conference_id": conference_id}
    )
    return Conference(**{**conference_doc, "enrollment_count": n})


@router.post("/", response_model=Conference)
async def create_conference(
    conference: Conference,
    claims: TokenClaims = Depends(require_staff),
):
    conference_dict = conference.model_dump(exclude_unset=True, by_alias=True)
    conference_dict.pop("_id", None)
    conference_dict.pop("enrollment_count", None)
    conference_dict["created_by_user_id"] = claims.user_id

    result = await conferences_collection.insert_one(conference_dict)
    conference_dict["_id"] = result.inserted_id

    await publish_event(
        "conference.created",
        {
            "conference_id": str(result.inserted_id),
            "title": conference_dict.get("title"),
            "created_by_user_id": claims.user_id,
        },
    )

    return Conference(**conference_dict)


@router.put("/{conference_id}", response_model=Conference)
async def update_conference(
    conference_id: str,
    conference: Conference,
    claims: TokenClaims = Depends(get_token_claims),
):
    existing = await conferences_collection.find_one({"_id": as_object_id(conference_id)})
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Conferencia no encontrada"
        )

    if (
        existing.get("created_by_user_id") != claims.user_id
        and claims.role not in ["super_admin", "web_master"]
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para editar esta conferencia",
        )

    conference_dict = conference.model_dump(exclude_unset=True, by_alias=True)
    conference_dict.pop("_id", None)
    conference_dict.pop("enrollment_count", None)

    await conferences_collection.update_one(
        {"_id": as_object_id(conference_id)}, {"$set": conference_dict}
    )
    return Conference(**{**existing, **conference_dict, "_id": existing["_id"]})


@router.delete("/{conference_id}")
async def delete_conference(
    conference_id: str, claims: TokenClaims = Depends(get_token_claims)
):
    existing = await conferences_collection.find_one({"_id": as_object_id(conference_id)})
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Conferencia no encontrada"
        )

    if (
        existing.get("created_by_user_id") != claims.user_id
        and claims.role not in ["super_admin", "web_master"]
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para eliminar esta conferencia",
        )

    await conferences_collection.delete_one({"_id": as_object_id(conference_id)})
    return {"message": "Conferencia eliminada"}

