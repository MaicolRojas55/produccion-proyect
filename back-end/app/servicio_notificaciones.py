"""
Módulo para integración con el microservicio de notificaciones.

Maneja el envío de solicitudes HTTP al servicio de notificaciones
con fallback graceful si el servicio no está disponible.
"""

import logging
from typing import Optional

import httpx

from .config import settings

logger = logging.getLogger(__name__)


class ClienteNotificaciones:
    """Cliente HTTP para comunicarse con el microservicio de notificaciones."""

    def __init__(self):
        self.url_base = settings.url_servicio_notificaciones
        self.tiempo_espera = settings.tiempo_espera_notificaciones
        self.habilitado = settings.habilitar_notificaciones

    async def enviar_otp(
        self, email_destino: str, nombre_usuario: str, codigo_otp: str, minutos_expiracion: int = 10
    ) -> bool:
        """Envía un código OTP al microservicio de notificaciones."""
        if not self.habilitado:
            logger.info("Servicio de notificaciones deshabilitado - saltando envío OTP")
            return False

        carga_util = {
            "tipo": "otp",
            "email_destino": email_destino,
            "nombre_destinatario": nombre_usuario,
            "asunto": "Tu código OTP de CONIITI",
            "datos": {
                "codigo_otp": codigo_otp,
                "minutos_expiracion": minutos_expiracion,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=self.tiempo_espera) as cliente:
                respuesta = await cliente.post(
                    f"{self.url_base}/notify",
                    json=carga_util,
                )
                respuesta.raise_for_status()
                resultado = respuesta.json()
                logger.info(f"OTP enviado a {email_destino} via microservicio")
                return resultado.get("enviada", False)
        except httpx.RequestError as error:
            logger.warning(
                f"Error al contactar servicio de notificaciones para OTP a {email_destino}: {error}"
            )
            return False
        except Exception as error:
            logger.error(f"Error inesperado al enviar OTP: {error}")
            return False

    async def enviar_bienvenida(self, email_destino: str, nombre_usuario: str) -> bool:
        """Envía un email de bienvenida al microservicio de notificaciones."""
        if not self.habilitado:
            logger.info("Servicio de notificaciones deshabilitado - saltando envío de bienvenida")
            return False

        carga_util = {
            "tipo": "bienvenida",
            "email_destino": email_destino,
            "nombre_destinatario": nombre_usuario,
            "asunto": "¡Bienvenido a CONIITI!",
            "datos": {},
        }

        try:
            async with httpx.AsyncClient(timeout=self.tiempo_espera) as cliente:
                respuesta = await cliente.post(
                    f"{self.url_base}/notify",
                    json=carga_util,
                )
                respuesta.raise_for_status()
                resultado = respuesta.json()
                logger.info(f"Bienvenida enviada a {email_destino} via microservicio")
                return resultado.get("enviada", False)
        except httpx.RequestError as error:
            logger.warning(
                f"Error al contactar servicio de notificaciones para bienvenida a {email_destino}: {error}"
            )
            return False
        except Exception as error:
            logger.error(f"Error inesperado al enviar bienvenida: {error}")
            return False

    async def enviar_recordatorio_sesion(
        self,
        email_destino: str,
        nombre_usuario: str,
        titulo_sesion: str,
        fecha: str,
        hora: str,
        lugar: str,
    ) -> bool:
        """Envía un recordatorio de sesión al microservicio de notificaciones."""
        if not self.habilitado:
            logger.info("Servicio de notificaciones deshabilitado - saltando recordatorio de sesión")
            return False

        carga_util = {
            "tipo": "recordatorio_sesion",
            "email_destino": email_destino,
            "nombre_destinatario": nombre_usuario,
            "asunto": "Recordatorio de tu sesión registrada",
            "datos": {
                "titulo_sesion": titulo_sesion,
                "fecha": fecha,
                "hora": hora,
                "lugar": lugar,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=self.tiempo_espera) as cliente:
                respuesta = await cliente.post(
                    f"{self.url_base}/notify",
                    json=carga_util,
                )
                respuesta.raise_for_status()
                resultado = respuesta.json()
                logger.info(f"Recordatorio enviado a {email_destino} via microservicio")
                return resultado.get("enviada", False)
        except httpx.RequestError as error:
            logger.warning(
                f"Error al contactar servicio de notificaciones para recordatorio a {email_destino}: {error}"
            )
            return False
        except Exception as error:
            logger.error(f"Error inesperado al enviar recordatorio: {error}")
            return False


# Instancia global del cliente
cliente_notificaciones = ClienteNotificaciones()
