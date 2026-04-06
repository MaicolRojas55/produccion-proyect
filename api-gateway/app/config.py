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
    secreto_jwt: str = os.getenv("JWT_SECRET", "super-secret-replace-this")
    # Algoritmo JWT compartido con el backend
    algoritmo_jwt: str = os.getenv("JWT_ALGORITHM", "HS256")
    # Puerto donde escucha el gateway
    puerto_gateway: int = 8001
    # Tiempo máximo de espera al consultar el backend
    tiempo_espera_backend: float = float(os.getenv("BACKEND_TIMEOUT", "30"))
    # Versión expuesta por el gateway para trazabilidad
    version_gateway: str = os.getenv("GATEWAY_VERSION", "0.2.0")
    # Limite simple por IP para proteger el gateway de abuso basico
    limite_solicitudes_por_minuto: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "100"))

    class Config:
        env_file = ".env"


# Instancia global de configuración
configuracion = ConfiguracionGateway()
