from jose import JWTError, jwt
from fastapi import HTTPException, status

from .config import configuracion


def extraer_token_bearer(autorizacion: str | None) -> str:
    """Extrae el token JWT desde el header Authorization."""
    if not autorizacion:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Falta el encabezado Authorization",
            headers={"WWW-Authenticate": "Bearer"},
        )

    esquema, _, token = autorizacion.partition(" ")
    if esquema.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Formato de token invalido",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return token


def validar_token_jwt(token: str) -> dict:
    """Valida la firma y claims minimos del token emitido por el backend."""
    try:
        carga = jwt.decode(
            token,
            configuracion.secreto_jwt,
            algorithms=[configuracion.algoritmo_jwt],
        )
    except JWTError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        ) from error

    if not carga.get("sub") or not carga.get("user_id"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token sin datos obligatorios",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return carga


def validar_autorizacion(autorizacion: str | None) -> dict:
    """Valida el header Authorization completo y retorna los claims del usuario."""
    token = extraer_token_bearer(autorizacion)
    return validar_token_jwt(token)