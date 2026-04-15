from bson import ObjectId
from fastapi import HTTPException, status


def as_object_id(id_str: str) -> ObjectId:
    try:
        return ObjectId(id_str)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"ID con formato inválido: {id_str}",
        )
