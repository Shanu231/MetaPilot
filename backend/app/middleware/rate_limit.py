import logging
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import redis.asyncio as aioredis
from app.core.config import settings

logger = logging.getLogger("metapilot_backend")

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp, rate_limit: int = 60, window_secs: int = 60):
        super().__init__(app)
        self.rate_limit = rate_limit
        self.window_secs = window_secs
        self.redis_client = None
        
        try:
            self.redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        except Exception as e:
            logger.warning(f"Failed to connect to Redis for rate limiting: {e}. Rate limiter is disabled.")

    async def dispatch(self, request: Request, call_next) -> Response:
        # Bypass rate limit checks on system telemetry queries
        if request.url.path.startswith("/api/system/"):
            return await call_next(request)

        if not self.redis_client:
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        key = f"rate:{client_ip}:{request.url.path}"

        try:
            current_hits = await self.redis_client.get(key)
            
            if current_hits and int(current_hits) >= self.rate_limit:
                logger.warning(f"Rate limit exceeded for IP: {client_ip} on path: {request.url.path}")
                return JSONResponse(
                    status_code=429,
                    content={
                        "success": False,
                        "error": {
                            "code": "TOO_MANY_REQUESTS",
                            "message": "Too many requests. Please slow down and try again later."
                        }
                    }
                )

            # Increment count
            async with self.redis_client.pipeline(transaction=True) as pipe:
                await pipe.incr(key)
                if not current_hits:
                    await pipe.expire(key, self.window_secs)
                await pipe.execute()

        except Exception as e:
            # Graceful fallback: let request pass when cache goes down
            logger.warning(f"Redis rate limiter exception occurred: {e}. Bypassing limit checks.")

        return await call_next(request)
