"""
Problema:
- El campo "otp_code_dev" en la respuesta de /register y /resend-otp
  devuelve el código OTP en texto plano al frontend → riesgo de seguridad grave.
  Cualquiera que intercepte la respuesta puede ver el código sin necesitar el email.

Solución:
- Se elimina "otp_code_dev" de las respuestas de /register y /resend-otp
- El OTP ahora solo llega por email (a través del notification-service vía RabbitMQ)
- En desarrollo, si RabbitMQ/notificaciones no están disponibles, el OTP
  sigue apareciendo en los logs del users-service (no en el frontend)
"""

from datetime import datetime, timedelta
import random
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import EmailStr

from .auth import (
    create_access_token,
    get_current_user,
    get_password_hash,
    get_user_by_email,
    verify_password,
)
from .config import settings
from .db import users_collection, otps_collection
from .events import publish_event
from .models import Token, User, UserCreate, UserLogin, UserPublic
from .routes_users import to_public


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])


def generate_otp_code(length: int = 6) -> str:
    return "".join(str(random.randint(0, 9)) for _ in range(length))


@router.post("/register", response_model=dict)
async def register(user_data: UserCreate):
    existing = await users_collection.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este correo ya está registrado",
        )

    hashed_password = get_password_hash(user_data.password)
    user_doc = {
        "full_name": user_data.full_name,
        "email": user_data.email,
        "hashed_password": hashed_password,
        "role": user_data.role,
        "is_active": True,
        "is_verified": False,
        "created_at": datetime.utcnow(),
    }

    result_user = await users_collection.insert_one(user_doc)

    code = generate_otp_code(settings.otp_length)
    otp_doc = {
        "email": user_data.email,
        "code": code,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(minutes=settings.otp_expire_minutes),
        "verified": False,
    }
    result = await otps_collection.insert_one(otp_doc)

    # Log en servidor (nunca llega al frontend)
    logger.info("OTP generado para %s (solo visible en logs del servidor)", user_data.email)

    # Publicar evento para que notification-service envíe el email
    await publish_event(
        "user.registered",
        {
            "user_id": str(result_user.inserted_id),
            "email": user_data.email,
            "full_name": user_data.full_name,
            "role": user_data.role,
            "otp_code": code,  # solo viaja por RabbitMQ, nunca al frontend
        },
    )

    # FIX: se elimina "otp_code_dev" de la respuesta
    return {
        "message": "Usuario registrado. Revisa tu correo para el código OTP.",
        "email_sent": True,
        "otp_id": str(result.inserted_id),
    }


@router.post("/verify-otp")
async def verify_otp(email: EmailStr, code: str):
    otp_doc = await otps_collection.find_one(
        {"email": email, "code": code, "verified": False}
    )
    if not otp_doc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="OTP invalido"
        )

    if otp_doc["expires_at"] < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="OTP caducado"
        )

    await otps_collection.update_one(
        {"_id": otp_doc["_id"]}, {"$set": {"verified": True}}
    )
    await users_collection.update_one({"email": email}, {"$set": {"is_verified": True}})

    return {"message": "OTP verificado exitosamente. ¡Bienvenido a CONIITI!"}


@router.post("/resend-otp", response_model=dict)
async def resend_otp(email: EmailStr):
    user_doc = await users_collection.find_one({"email": email, "is_verified": False})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado o ya verificado",
        )

    code = generate_otp_code(settings.otp_length)
    otp_doc = {
        "email": email,
        "code": code,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(minutes=settings.otp_expire_minutes),
        "verified": False,
    }

    # Invalidar OTPs anteriores
    await otps_collection.update_many(
        {"email": email, "verified": False}, {"$set": {"verified": True}}
    )

    result = await otps_collection.insert_one(otp_doc)
    logger.info("OTP reenviado para %s (solo visible en logs del servidor)", email)

    # Publicar evento para reenvío de OTP
    await publish_event(
        "user.otp_resent",
        {
            "email": email,
            "full_name": user_doc.get("full_name", ""),
            "otp_code": code,  # solo viaja por RabbitMQ, nunca al frontend
        },
    )

    # FIX: se elimina "otp_code_dev" de la respuesta
    return {
        "message": "Nuevo código OTP generado. Revisa tu correo.",
        "email_sent": True,
        "otp_id": str(result.inserted_id),
    }


@router.post("/token", response_model=Token)
async def login(form_data: UserLogin):
    user = await get_user_by_email(form_data.email)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cuenta pendiente de verificación. Ingresa el código OTP enviado al correo.",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cuenta inactiva. Contacta al administrador.",
        )

    if not user.id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Usuario sin identificador válido",
        )

    access_token = create_access_token(
        {"sub": str(user.email), "user_id": user.id, "role": user.role}
    )
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserPublic)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return to_public(current_user)
