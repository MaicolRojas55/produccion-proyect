from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from .auth import get_current_active_user
from .db import users_collection
from .models import User, UserPublic


router = APIRouter(prefix="/users", tags=["users"])


def to_public(u: User) -> UserPublic:
    return UserPublic(
        **{
            "_id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active,
            "is_verified": u.is_verified,
            "created_at": u.created_at,
        }
    )


@router.get("/", response_model=List[UserPublic])
async def list_users(current_user: User = Depends(get_current_active_user)):
    if current_user.role not in ["super_admin", "web_master"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions",
        )
    cursor = users_collection.find({})
    out: list[UserPublic] = []
    async for doc in cursor:
        out.append(to_public(User(**doc)))
    return out

