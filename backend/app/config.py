"""Application configuration loaded from .env"""
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    PROJECT_NAME: str = "Recruiter-AI Backend"
    VERSION: str = "1.0.0"

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://avnadmin:PASSWORD@HOST.aivencloud.com:PORT/defaultdb?sslmode=require",
    )
    ENV: str = os.getenv("ENV", "development")

    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]


settings = Settings()