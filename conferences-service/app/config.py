import os

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    mongodb_uri: str = Field(
        default=os.getenv("MONGODB_URI", "mongodb://conferences-mongo:27017"),
        validation_alias=AliasChoices("MONGODB_URI", "MONGODB_URL"),
    )
    mongodb_db: str = Field(
        default="conferences_db",
        validation_alias=AliasChoices("MONGODB_DB"),
    )

    jwt_secret_key: str = Field(
        default="super-secret-replace-this",
        validation_alias=AliasChoices("JWT_SECRET_KEY", "JWT_SECRET"),
    )
    jwt_algorithm: str = Field(default="HS256")
    rabbitmq_url: str = Field(
        default=os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/"),
        validation_alias=AliasChoices("RABBITMQ_URL"),
    )
    events_exchange: str = Field(default="coniiti.events", validation_alias=AliasChoices("EVENTS_EXCHANGE"))


settings = Settings()
