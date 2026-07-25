from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import text
import redis.asyncio as aioredis
from app.database.db import get_db
from app.core.config import settings
from app.schemas.schemas import SystemHealth, SystemVersion

router = APIRouter()

@router.get("/health", response_model=SystemHealth)
async def health_check(db: AsyncSession = Depends(get_db)):
    db_healthy = "healthy"
    redis_healthy = "healthy"

    # Test postgres
    try:
        await db.execute(text("SELECT 1"))
    except Exception:
        db_healthy = "unhealthy"

    # Test redis connection
    try:
        r = aioredis.from_url(settings.REDIS_URL, socket_timeout=2)
        await r.ping()
        await r.close()
    except Exception:
        redis_healthy = "unhealthy"

    if db_healthy == "unhealthy" or redis_healthy == "unhealthy":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"System services degraded. Database: {db_healthy}. Redis: {redis_healthy}."
        )

    return SystemHealth(
        status="healthy",
        database=db_healthy,
        redis=redis_healthy
    )

@router.get("/readiness")
async def readiness_check():
    return {"status": "ready"}

@router.get("/version", response_model=SystemVersion)
async def version_info():
    return SystemVersion(
        version="2.0.0",
        project="MetaPilot",
        phase=2
    )
