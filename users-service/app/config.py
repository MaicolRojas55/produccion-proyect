from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    mongodb_uri: str = Field(
        default="mongodb://users-mongo:27017",
        validation_alias=AliasChoices("MONGODB_URI", "MONGODB_URL"),
    )
    mongodb_db: str = Field(default="users_db", validation_alias=AliasChoices("MONGODB_DB"))

    jwt_secret_key: str = Field(
        default="super-secret-replace-this",
        validation_alias=AliasChoices("JWT_SECRET_KEY", "JWT_SECRET"),
    )
    jwt_algorithm: str = Field(default="HS256")
    jwt_access_token_expires_minutes: int = Field(default=60)

    otp_length: int = Field(default=6)
    otp_expire_minutes: int = Field(default=10)

    rabbitmq_url: str = Field(
        default="amqp://guest:guest@rabbitmq:5672/",
        validation_alias=AliasChoices("RABBITMQ_URL"),
    )
    events_exchange: str = Field(default="coniiti.events", validation_alias=AliasChoices("EVENTS_EXCHANGE"))


settings = Settings()

