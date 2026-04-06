from pathlib import Path
import sys

from jinja2 import Environment, FileSystemLoader, select_autoescape

from .config import configuracion
from .models import RespuestaNotificacion, SolicitudNotificacion


RUTA_PLANTILLAS = Path(__file__).resolve().parent / "templates"
entorno_plantillas = Environment(
    loader=FileSystemLoader(RUTA_PLANTILLAS),
    autoescape=select_autoescape(["html", "xml"]),
)

MAPA_PLANTILLAS = {
    "otp": {
        "archivo": "otp.html",
        "asunto": "Tu codigo OTP de CONIITI",
    },
    "bienvenida": {
        "archivo": "welcome.html",
        "asunto": "Bienvenido a CONIITI",
    },
    "recordatorio_sesion": {
        "archivo": "session_reminder.html",
        "asunto": "Recordatorio de sesion registrada",
    },
}


class ServicioNotificaciones:
    """Servicio central para renderizar y enviar notificaciones."""

    def _obtener_configuracion_plantilla(self, tipo: str) -> dict[str, str]:
        if tipo not in MAPA_PLANTILLAS:
            raise ValueError(f"Tipo de notificacion no soportado: {tipo}")
        return MAPA_PLANTILLAS[tipo]

    def _renderizar_html(self, solicitud: SolicitudNotificacion) -> tuple[str, str]:
        configuracion_plantilla = self._obtener_configuracion_plantilla(solicitud.tipo)
        plantilla = entorno_plantillas.get_template(configuracion_plantilla["archivo"])
        asunto = solicitud.asunto or configuracion_plantilla["asunto"]
        html = plantilla.render(
            nombre_destinatario=solicitud.nombre_destinatario or "Participante",
            email_destino=solicitud.email_destino,
            asunto=asunto,
            datos=solicitud.datos,
        )
        return asunto, html

    async def enviar_notificacion(self, solicitud: SolicitudNotificacion) -> RespuestaNotificacion:
        """Renderiza la notificacion y la envia en modo simulado por ahora."""
        asunto, html = self._renderizar_html(solicitud)

        if configuracion.modo_envio == "simulado":
            print("=" * 80, file=sys.stdout, flush=True)
            print("SERVICIO DE NOTIFICACIONES - ENVIO SIMULADO", file=sys.stdout, flush=True)
            print(f"Para: {solicitud.email_destino}", file=sys.stdout, flush=True)
            print(f"Asunto: {asunto}", file=sys.stdout, flush=True)
            print(html, file=sys.stdout, flush=True)
            print("=" * 80, file=sys.stdout, flush=True)
            return RespuestaNotificacion(
                enviada=True,
                tipo=solicitud.tipo,
                email_destino=solicitud.email_destino,
                asunto=asunto,
                modo_envio=configuracion.modo_envio,
                detalle="Notificacion procesada en modo simulado",
            )

        return RespuestaNotificacion(
            enviada=False,
            tipo=solicitud.tipo,
            email_destino=solicitud.email_destino,
            asunto=asunto,
            modo_envio=configuracion.modo_envio,
            detalle="Modo SMTP aun no implementado en esta fase",
        )


servicio_notificaciones = ServicioNotificaciones()
