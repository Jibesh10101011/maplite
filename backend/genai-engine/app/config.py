
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DB_URL: str
    SECRET_KEY: str
    DEBUG: bool = False
    GEO_LOCATION_API: str
    IMAGE_LOCATION_API_ENDPOINT: str
    IMAGE_LOCATION_API_KEY: str
    GEMINI_API_KEY: str

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()