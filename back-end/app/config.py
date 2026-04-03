from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db: str = "produccion_db"
    jwt_secret_key: str = "super-secret-replace-this"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expires_minutes: int = 60
    otp_length: int = 6
    otp_expire_minutes: int = 10

    class Config:
        env_file = ".env"


settings = Settings()
