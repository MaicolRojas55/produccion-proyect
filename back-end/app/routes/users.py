from fastapi import APIRouter, Depends, HTTPException, status

from ..auth import get_current_admin_user, get_current_active_user
from ..db import users_collection
from ..models import User

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.get("/")
async def list_users(current_user: User = Depends(get_current_admin_user)):
    cursor = users_collection.find({}, {"hashed_password": 0})
    users = []
    async for user in cursor:
        user["id"] = str(user.get("_id"))
        users.append(user)
    return users


@router.get("/{user_id}", response_model=User)
async def get_user(user_id: str, current_user: User = Depends(get_current_admin_user)):
    user_doc = await users_collection.find_one({"_id": user_id})
    if not user_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    return User(**user_doc)
