import logging

from fastapi import APIRouter, Request
from fastapi.responses import Response

from .auth import validar_autorizacion
from .client import reenviar_solicitud


logger = logging.getLogger(__name__)
enrutador_gateway = APIRouter(prefix="/api", tags=["gateway"])

RUTAS_PUBLICAS = {
    "auth/register",
    "auth/token",
    "auth/verify-otp",
    "auth/resend-otp",
}


def ruta_es_publica(ruta: str) -> bool:
    """Determina si una ruta puede pasar sin token porque pertenece al flujo de auth."""
    return ruta in RUTAS_PUBLICAS


@enrutador_gateway.api_route("/{ruta_completa:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
async def proxy_gateway(ruta_completa: str, request: Request) -> Response:
    """Intercepta las solicitudes API, valida acceso y las reenvia al backend."""
    ruta_normalizada = ruta_completa.strip("/")

    if request.method != "OPTIONS" and not ruta_es_publica(ruta_normalizada):
        claims_usuario = validar_autorizacion(request.headers.get("authorization"))
        logger.info(
            "Solicitud autorizada en gateway",
            extra={
                "ruta": ruta_normalizada,
                "metodo": request.method,
                "usuario": claims_usuario.get("sub"),
                "rol": claims_usuario.get("role"),
            },
        )

    if ruta_es_publica(ruta_normalizada):
        logger.info("Solicitud publica reenviada: %s %s", request.method, ruta_normalizada)

    return await reenviar_solicitud(request=request, ruta_backend=ruta_normalizada)