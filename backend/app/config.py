"""Application configuration loaded from .env"""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    PROJECT_NAME: str = os.getenv(
        "PROJECT_NAME",
        "Recruiter-AI Backend",
    )

    VERSION: str = os.getenv(
        "VERSION",
        "1.0.0",
    )

    ENV: str = os.getenv(
        "ENV",
        "development",
    )

    # Required DB connection string from .env
    DB_CON_STR: str = os.getenv(
        "DB_CON_STR",
        "",
    )

    # Optional legacy support
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "",
    )

    CSV_DIR: str = os.getenv(
        "CSV_DIR",
        "./csv",
    )

    # Allow all origins
    CORS_ORIGINS: list = ["*"]


settings = Settings()