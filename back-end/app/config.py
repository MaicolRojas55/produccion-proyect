from pydantic import AliasChoices, Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_INSECURE_DEFAULTS = {"super-secret-replace-this", "secret", "changeme", ""}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    mongodb_uri: str = Field(
        default="mongodb://localhost:27017",
        validation_alias=AliasChoices("MONGODB_URI", "MONGODB_URL"),
    )
    mongodb_db: str = Field(default="produccion_db")
    jwt_secret_key: str = Field(
        default="super-secret-replace-this",
        validation_alias=AliasChoices("JWT_SECRET_KEY", "JWT_SECRET"),
    )
    jwt_algorithm: str = Field(default="HS256")
    jwt_access_token_expires_minutes: int = Field(default=60)
    otp_length: int = Field(default=6)
    otp_expire_minutes: int = Field(default=10)

    smtp_server: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from_email: str = ""
    smtp_from_name: str = "CONIITI Conference"

    url_servicio_notificaciones: str = Field(
        default="http://localhost:8002",
        validation_alias=AliasChoices("NOTIFICATION_SERVICE_URL", "SERVICIO_NOTIFICACIONES_URL"),
    )
    tiempo_espera_notificaciones: float = Field(default=10.0)
    habilitar_notificaciones: bool = Field(default=True)

    @model_validator(mode="after")
    def check_secrets(self) -> "Settings":
        if self.jwt_secret_key in _INSECURE_DEFAULTS or len(self.jwt_secret_key) < 32:
            import warnings
            warnings.warn(
                "JWT_SECRET_KEY es inseguro o demasiado corto (min 32 chars). "
                "Genera uno con: python -c \"import secrets; print(secrets.token_hex(64))\"",
                stacklevel=2,
            )
        return self


settings = Settings()
