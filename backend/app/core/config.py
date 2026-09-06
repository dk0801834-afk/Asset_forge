import os
from pathlib import Path
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


def _resolve_dir(env_name: str, default_subpath: str) -> Path:
    """Resolve a directory path from env var or default, creating it if needed."""
    val = os.getenv(env_name)
    if val:
        p = Path(val)
    else:
        base = Path(__file__).resolve().parent.parent.parent
        p = base / default_subpath
    p.mkdir(parents=True, exist_ok=True)
    return p


class Settings(BaseSettings):
    PROJECT_NAME: str = "AssetForge API"
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./assetforge.db")

    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

    # Stripe
    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY", "")
    STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    STRIPE_PUBLISHABLE_KEY: str = os.getenv("STRIPE_PUBLISHABLE_KEY", "")

    # URLs
    BASE_URL: str = os.getenv("BASE_URL", "http://localhost:8000")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # Email
    SMTP_HOST: str = os.getenv("SMTP_HOST", "")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "noreply@assetforge.io")

    # AI
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    AI_API_URL: str = os.getenv("AI_API_URL", "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image")

    # Storage (resolved lazily)
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATA_DIR: Path = Path(__file__).resolve().parent.parent.parent / "data"

    @property
    def DOWNLOADS_DIR(self) -> Path:
        return _resolve_dir("DOWNLOADS_DIR", "data/downloads")

    @property
    def ASSETS_DIR(self) -> Path:
        return _resolve_dir("ASSETS_DIR", "data/assets")

    @property
    def TEMP_DIR(self) -> Path:
        return _resolve_dir("TEMP_DIR", "data/temp")

    DOWNLOAD_LINK_EXPIRE_HOURS: int = int(os.getenv("DOWNLOAD_LINK_EXPIRE_HOURS", "24"))

    class Config:
        case_sensitive = True


settings = Settings()
settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
# Touch to ensure subdirectories exist
_ = settings.DOWNLOADS_DIR
_ = settings.ASSETS_DIR
_ = settings.TEMP_DIR
