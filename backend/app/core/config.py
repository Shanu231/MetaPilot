from typing import List, Union
import logging
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "MetaPilot"
    API_VERSION: str = "/api"
    DEBUG: bool = True

    # Security Mappings
    JWT_SECRET_KEY: str = "3b00c9e62f58e1c6cd1492ba268db45136873322aa6006f157ad71249b2ef1e0"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7


    # Database Mappings
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/metapilot"

    # Redis Mappings
    REDIS_URL: str = "redis://localhost:6379/0"

    # CORS Mappings
    ALLOWED_CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://localhost:3000"

    # DataHub Integration Mappings
    DATAHUB_GMS_URL: str = "http://localhost:8080"
    DATAHUB_PAT_TOKEN: str = ""
    METADATA_CACHE_TTL_SECS: int = 3600

    # LLM Providers Configuration
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    PRIMARY_AI_PROVIDER: str = "gemini"

    # Vector DB Configuration
    CHROMADB_PERSIST_PATH: str = "./chroma_db"
    USE_CHROMADB: bool = True

    @field_validator("JWT_SECRET_KEY", mode="before")
    @classmethod
    def validate_jwt_secret(cls, v: str) -> str:
        default_secret = "3b00c9e62f58e1c6cd1492ba268db45136873322aa6006f157ad71249b2ef1e0"
        if v == default_secret:
            logger = logging.getLogger("metapilot_backend")
            logger.warning(
                "SECURITY WARNING: JWT_SECRET_KEY is configured with the default fallback value. "
                "For production environments, override this by setting JWT_SECRET_KEY in the environment or .env file."
            )
        return v

    @field_validator("ALLOWED_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()

