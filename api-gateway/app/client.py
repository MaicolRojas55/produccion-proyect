import httpx
from fastapi import HTTPException, Request, Response, status

from .config import configuracion


ENCABEZADOS_EXCLUIDOS = {"host", "content-length", "connection"}


def construir_url_backend(ruta_backend: str, consulta: str) -> str:
    """Construye la URL final del backend preservando query params."""
    url = f"{configuracion.url_backend.rstrip('/')}/{ruta_backend.lstrip('/')}"
    if consulta:
        return f"{url}?{consulta}"
    return url


def filtrar_encabezados_solicitud(request: Request) -> dict[str, str]:
    """Filtra headers que no deben reenviarse tal cual al backend."""
    encabezados = {
        clave: valor
        for clave, valor in request.headers.items()
        if clave.lower() not in ENCABEZADOS_EXCLUIDOS
    }
    encabezados["X-Forwarded-By"] = "api-gateway"
    return encabezados


def construir_respuesta_gateway(respuesta_backend: httpx.Response) -> Response:
    """Devuelve al cliente la respuesta del backend con headers de trazabilidad."""
    encabezados_respuesta = {
        clave: valor
        for clave, valor in respuesta_backend.headers.items()
        if clave.lower() not in {"content-length", "transfer-encoding", "connection"}
    }
    encabezados_respuesta["X-Gateway-Version"] = configuracion.version_gateway
    encabezados_respuesta["X-Forwarded-By"] = "api-gateway"

    return Response(
        content=respuesta_backend.content,
        status_code=respuesta_backend.status_code,
        headers=encabezados_respuesta,
        media_type=respuesta_backend.headers.get("content-type"),
    )


async def reenviar_solicitud(request: Request, ruta_backend: str) -> Response:
    """Reenvia la solicitud original al backend respetando metodo, body y query string."""
    url_destino = construir_url_backend(ruta_backend=ruta_backend, consulta=request.url.query)
    cuerpo = await request.body()
    encabezados = filtrar_encabezados_solicitud(request)

    try:
        async with httpx.AsyncClient(timeout=configuracion.tiempo_espera_backend) as cliente:
            respuesta_backend = await cliente.request(
                method=request.method,
                url=url_destino,
                content=cuerpo,
                headers=encabezados,
            )
    except httpx.RequestError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"No fue posible comunicarse con el backend: {error}",
        ) from error

    return construir_respuesta_gateway(respuesta_backend)