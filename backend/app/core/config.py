"""
Finity – Smart Investment Coach
Core configuration module
"""
import os
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    APP_NAME: str = "Finity – Smart Investment Coach"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    API_PREFIX: str = "/api/v1"

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    # AI Services
    GROQ_API_KEY: str = ""
    OPENAI_API_KEY: Optional[str] = None
    AI_PROVIDER: str = "groq"  # "groq" or "openai"
    AI_MODEL: str = "llama-3.3-70b-versatile"

    # JWT Auth
    SECRET_KEY: str = "finity-dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
