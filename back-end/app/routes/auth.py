from datetime import datetime, timedelta
import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import EmailStr

from ..auth import authenticate_user, create_access_token, get_current_user, get_password_hash
from ..config import settings
from ..db import users_collection, otps_collection
from ..models import OTP, Token, UserCreate, User, UserLogin
from ..email_service import email_service
from ..servicio_notificaciones import cliente_notificaciones

router = APIRouter(prefix="/auth", tags=["auth"])


def generate_otp_code(length: int = 6) -> str:
    return ''.join(str(secrets.randbelow(10)) for _ in range(length))


@router.post("/register", response_model=dict)
async def register(user_data: UserCreate):
    existing = await users_collection.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

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

    await users_collection.insert_one(user_doc)

    code = generate_otp_code(settings.otp_length)
    otp_doc = {
        "email": user_data.email,
        "code": code,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(minutes=settings.otp_expire_minutes),
        "verified": False,
    }
    result = await otps_collection.insert_one(otp_doc)

    # Enviar OTP a través del microservicio de notificaciones
    otp_enviado = await cliente_notificaciones.enviar_otp(
        email_destino=user_data.email,
        nombre_usuario=user_data.full_name,
        codigo_otp=code,
        minutos_expiracion=settings.otp_expire_minutes,
    )

    # Si falla el microservicio, intentar con email_service simulado como fallback
    if not otp_enviado:
        otp_enviado = await email_service.send_otp_email(
            to_email=user_data.email,
            otp_code=code,
            user_name=user_data.full_name
        )

    return {
        "message": "Usuario registrado. Verifica tu código OTP.",
        "email_sent": otp_enviado,
        "otp_id": str(result.inserted_id),
        "otp_code_dev": code,
    }


@router.post("/verify-otp")
async def verify_otp(email: EmailStr, code: str):
    otp_doc = await otps_collection.find_one({"email": email, "code": code, "verified": False})
    if not otp_doc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP invalido")

    if otp_doc["expires_at"] < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP caducado")

    await otps_collection.update_one({"_id": otp_doc["_id"]}, {"$set": {"verified": True}})
    await users_collection.update_one({"email": email}, {"$set": {"is_verified": True}})

    # Enviar email de bienvenida a través del microservicio de notificaciones
    user_doc = await users_collection.find_one({"email": email})
    if user_doc:
        bienvenida_enviada = await cliente_notificaciones.enviar_bienvenida(
            email_destino=email,
            nombre_usuario=user_doc.get("full_name", "Usuario")
        )

        # Si falla el microservicio, usar fallback del email_service
        if not bienvenida_enviada:
            await email_service.send_welcome_email(
                to_email=email,
                user_name=user_doc.get("full_name", "Usuario")
            )

    return {"message": "OTP verificado exitosamente. ¡Bienvenido a CONIITI!"}


@router.post("/resend-otp", response_model=dict)
async def resend_otp(email: EmailStr):
    """Reenviar código OTP si expiró"""
    # Verificar que el usuario existe y no está verificado
    user_doc = await users_collection.find_one({"email": email, "is_verified": False})
    if not user_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado o ya verificado")

    # Generar nuevo código OTP
    code = generate_otp_code(settings.otp_length)
    otp_doc = {
        "email": email,
        "code": code,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(minutes=settings.otp_expire_minutes),
        "verified": False,
    }

    # Invalidar OTPs anteriores no verificados
    await otps_collection.update_many(
        {"email": email, "verified": False},
        {"$set": {"verified": True}}  # Marcar como usados
    )

    # Insertar nuevo OTP
    result = await otps_collection.insert_one(otp_doc)

    # Enviar OTP a través del microservicio de notificaciones
    otp_enviado = await cliente_notificaciones.enviar_otp(
        email_destino=email,
        nombre_usuario=user_doc.get("full_name", "Usuario"),
        codigo_otp=code,
        minutos_expiracion=settings.otp_expire_minutes,
    )

    # Si falla, usar fallback
    if not otp_enviado:
        otp_enviado = await email_service.send_otp_email(
            to_email=email,
            otp_code=code,
            user_name=user_doc.get("full_name", "Usuario")
        )

    return {
        "message": "Nuevo código OTP generado.",
        "email_sent": otp_enviado,
        "otp_id": str(result.inserted_id),
        "otp_code_dev": code,
    }


@router.post("/token", response_model=Token)
async def login(form_data: UserLogin):
    user = await authenticate_user(form_data.email, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Correo o contraseña incorrectos", headers={"WWW-Authenticate": "Bearer"})

    access_token = create_access_token({"sub": str(user.email), "user_id": str(user.id), "role": user.role})
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
