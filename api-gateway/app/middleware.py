import logging
import time
from collections import defaultdict, deque

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from .config import configuracion


logger = logging.getLogger(__name__)
ventanas_por_ip: dict[str, deque[float]] = defaultdict(deque)


class MiddlewareRateLimit(BaseHTTPMiddleware):
    """Limita solicitudes por IP en una ventana deslizante de 60 segundos."""

    async def dispatch(self, request: Request, call_next):
        direccion_ip = request.client.host if request.client else "desconocida"
        instante_actual = time.time()
        ventana = ventanas_por_ip[direccion_ip]

        while ventana and instante_actual - ventana[0] > 60:
            ventana.popleft()

        if len(ventana) >= configuracion.limite_solicitudes_por_minuto:
            return JSONResponse(
                status_code=429,
                content={
                    "detalle": "Limite de solicitudes excedido para esta IP",
                    "limite_por_minuto": configuracion.limite_solicitudes_por_minuto,
                },
                headers={"Retry-After": "60"},
            )

        ventana.append(instante_actual)
        return await call_next(request)


class MiddlewareAuditoriaGateway(BaseHTTPMiddleware):
    """Registra informacion basica de entrada y salida para auditoria tecnica."""

    async def dispatch(self, request: Request, call_next):
        inicio = time.perf_counter()
        respuesta = await call_next(request)
        duracion_ms = round((time.perf_counter() - inicio) * 1000, 2)
        direccion_ip = request.client.host if request.client else "desconocida"

        logger.info(
            "gateway_request metodo=%s ruta=%s estado=%s ip=%s duracion_ms=%s",
            request.method,
            request.url.path,
            respuesta.status_code,
            direccion_ip,
            duracion_ms,
        )

        respuesta.headers["X-Response-Time-MS"] = str(duracion_ms)
        return respuesta