from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


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

    # Email SMTP settings - TEMPORALMENTE NO UTILIZADOS
    # En fase final, la verificación OTP será un microservicio dedicado
    # Por ahora, los códigos OTP se muestran en la terminal de desarrollo
    smtp_server: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from_email: str = ""
    smtp_from_name: str = "CONIITI Conference"


settings = Settings()
