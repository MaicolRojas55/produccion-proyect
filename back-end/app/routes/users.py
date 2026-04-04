from fastapi import APIRouter, Depends, HTTPException, status

from ..auth import get_current_admin_user, get_current_active_user, get_current_super_admin
from ..db import users_collection
from ..models import User, UserRoleUpdate
from ..mongo_utils import as_object_id

router = APIRouter(prefix="/users", tags=["users"])


def _public_user_dict(doc: dict) -> dict:
    doc = dict(doc)
    doc.pop("hashed_password", None)
    oid = doc.pop("_id", None)
    if oid is not None:
        doc["id"] = str(oid)
    return doc


@router.get("/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.get("/")
async def list_users(current_user: User = Depends(get_current_admin_user)):
    cursor = users_collection.find({}, {"hashed_password": 0})
    users = []
    async for user in cursor:
        users.append(_public_user_dict(user))
    return users


@router.get("/{user_id}", response_model=User)
async def get_user(user_id: str, current_user: User = Depends(get_current_admin_user)):
    user_doc = await users_collection.find_one({"_id": as_object_id(user_id)})
    if not user_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    return User(**user_doc)


@router.patch("/{user_id}")
async def update_user_role(
    user_id: str,
    body: UserRoleUpdate,
    current_user: User = Depends(get_current_super_admin),
):
    """Actualizar rol de un usuario. Solo Super Admin."""
    oid = as_object_id(user_id)
    target = await users_collection.find_one({"_id": oid})
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    await users_collection.update_one({"_id": oid}, {"$set": {"role": body.role}})
    updated = await users_collection.find_one({"_id": oid}, {"hashed_password": 0})
    assert updated
    return _public_user_dict(updated)


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user: User = Depends(get_current_super_admin),
):
    """Eliminar usuario: solo Super Admin."""
    oid = as_object_id(user_id)
    target = await users_collection.find_one({"_id": oid})
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    if str(target.get("_id")) == str(current_user.id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No puedes eliminar tu propia cuenta")

    await users_collection.delete_one({"_id": oid})
    return {"message": "Usuario eliminado"}
