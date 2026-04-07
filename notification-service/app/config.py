from pydantic_settings import BaseSettings
import os


# Configuraciones del Servicio de Notificaciones
class ConfiguracionNotificaciones(BaseSettings):
    """Cargar variables de entorno para el servicio de notificaciones"""
    # Puerto donde escucha el servicio
    puerto_notificaciones: int = int(os.getenv("NOTIFICATION_PORT", "8002"))
    # Nivel de logging (info, debug, error)
    nivel_log: str = os.getenv("LOG_LEVEL", "info")
    # Servidor SMTP para enviar emails (Gmail por defecto)
    servidor_smtp: str = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    # Puerto SMTP
    puerto_smtp: int = int(os.getenv("SMTP_PORT", "587"))
    # Credenciales SMTP (usuario/contraseña de aplicación)
    usuario_smtp: str = os.getenv("SMTP_USERNAME", "")
    contraseña_smtp: str = os.getenv("SMTP_PASSWORD", "")
    # Email de remitente (no-reply)
    email_remitente: str = os.getenv("SMTP_FROM_EMAIL", "noreply@coniiti.com")
    # Nombre visible del remitente
    nombre_remitente: str = os.getenv("SMTP_FROM_NAME", "CONIITI Conference")
    # Modo de envio: simulado o smtp
    modo_envio: str = os.getenv("NOTIFICATION_MODE", "simulado")
    # Version expuesta por el microservicio
    version_servicio: str = os.getenv("NOTIFICATION_VERSION", "0.2.0")

    # RabbitMQ (event-driven)
    rabbitmq_url: str = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
    events_exchange: str = os.getenv("EVENTS_EXCHANGE", "coniiti.events")
    events_queue: str = os.getenv("EVENTS_QUEUE", "notifications.q")

    # DB propia del servicio (SQLite en volumen)
    sqlite_path: str = os.getenv("SQLITE_PATH", "/data/notifications.sqlite")

    class Config:
        env_file = ".env"


# Instancia global de configuración
configuracion = ConfiguracionNotificaciones()
