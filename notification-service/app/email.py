import smtplib
import sys
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

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

    def _enviar_smtp(self, email_destino: str, asunto: str, html: str) -> bool:
        """
        Envía el email usando SMTP real (Gmail compatible con App Password).
        Retorna True si fue exitoso, False si falló.
        """
        if not configuracion.usuario_smtp or not configuracion.contraseña_smtp:
            print(
                "[NotificationService] ERROR: SMTP_USERNAME o SMTP_PASSWORD no configurados.\n"
                "Agrega las credenciales al archivo .env del notification-service.\n"
                "Para Gmail: genera una App Password en myaccount.google.com/security",
                file=sys.stderr,
                flush=True,
            )
            return False

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = asunto
            msg["From"] = f"{configuracion.nombre_remitente} <{configuracion.email_remitente}>"
            msg["To"] = email_destino
            msg.attach(MIMEText(html, "html", "utf-8"))

            with smtplib.SMTP(configuracion.servidor_smtp, configuracion.puerto_smtp, timeout=10) as server:
                server.ehlo()
                server.starttls()
                server.login(configuracion.usuario_smtp, configuracion.contraseña_smtp)
                server.sendmail(configuracion.email_remitente, email_destino, msg.as_string())

            print(f"[NotificationService] Email enviado a {email_destino} | Asunto: {asunto}", flush=True)
            return True

        except smtplib.SMTPAuthenticationError:
            print(
                "[NotificationService] ERROR de autenticación SMTP.\n"
                "Verifica SMTP_USERNAME y SMTP_PASSWORD.\n"
                "Para Gmail usa una App Password (16 caracteres), NO tu contraseña normal.",
                file=sys.stderr,
                flush=True,
            )
            return False
        except smtplib.SMTPException as e:
            print(f"[NotificationService] ERROR SMTP: {e}", file=sys.stderr, flush=True)
            return False
        except Exception as e:
            print(f"[NotificationService] ERROR inesperado: {e}", file=sys.stderr, flush=True)
            return False

    async def enviar_notificacion(self, solicitud: SolicitudNotificacion) -> RespuestaNotificacion:
        """Renderiza la notificacion y la envia segun el modo configurado."""
        asunto, html = self._renderizar_html(solicitud)

        # ── MODO SIMULADO (desarrollo local) ──────────────────────────────
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

        # ── MODO SMTP (producción) ─────────────────────────────────────────
        if configuracion.modo_envio == "smtp":
            exito = self._enviar_smtp(solicitud.email_destino, asunto, html)
            return RespuestaNotificacion(
                enviada=exito,
                tipo=solicitud.tipo,
                email_destino=solicitud.email_destino,
                asunto=asunto,
                modo_envio=configuracion.modo_envio,
                detalle="Email enviado correctamente" if exito else "Error al enviar email — revisa los logs",
            )

        # ── MODO DESCONOCIDO ───────────────────────────────────────────────
        return RespuestaNotificacion(
            enviada=False,
            tipo=solicitud.tipo,
            email_destino=solicitud.email_destino,
            asunto=asunto,
            modo_envio=configuracion.modo_envio,
            detalle=f"Modo de envio no reconocido: {configuracion.modo_envio}. Usa 'simulado' o 'smtp'.",
        )


servicio_notificaciones = ServicioNotificaciones()
