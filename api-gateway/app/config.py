from pydantic_settings import BaseSettings
import os


# Configuraciones del API Gateway
class ConfiguracionGateway(BaseSettings):
    """Cargar variables de entorno para el gateway"""
    # URL del backend monolito
    url_backend: str = os.getenv("BACKEND_URL", "http://backend:8000")
    # Nivel de logging (info, debug, error)
    nivel_log: str = os.getenv("LOG_LEVEL", "info")
    # Clave secreta para validación JWT
    secreto_jwt: str = os.getenv("JWT_SECRET", "dev-secret")
    # Puerto donde escucha el gateway
    puerto_gateway: int = 8001

    class Config:
        env_file = ".env"


# Instancia global de configuración
configurar = ConfiguracionGateway()
