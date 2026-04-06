from typing import Any, Literal

from pydantic import BaseModel, EmailStr, Field


TipoNotificacion = Literal["otp", "bienvenida", "recordatorio_sesion"]


class SolicitudNotificacion(BaseModel):
    """Carga util estandar para solicitar una notificacion."""

    tipo: TipoNotificacion
    email_destino: EmailStr
    nombre_destinatario: str | None = None
    asunto: str | None = None
    datos: dict[str, Any] = Field(default_factory=dict)


class RespuestaNotificacion(BaseModel):
    """Respuesta uniforme del microservicio de notificaciones."""

    enviada: bool
    tipo: TipoNotificacion
    email_destino: EmailStr
    asunto: str
    modo_envio: str
    detalle: str
