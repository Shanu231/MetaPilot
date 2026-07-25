import time
import uuid
import logging
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

# Setup logging config
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("metapilot_backend")

class LoggerExceptionMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.state.request_id = request_id
        start_time = time.time()

        # Log request receipt
        logger.info(
            f"Request Start - ID: {request_id} | Path: {request.method} {request.url.path} | Source: {request.client.host if request.client else 'unknown'}"
        )

        try:
            response = await call_next(request)
            process_time = time.time() - start_time
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Process-Time"] = f"{process_time:.4f}s"

            logger.info(
                f"Request End - ID: {request_id} | Status: {response.status_code} | Duration: {process_time:.4f}s"
            )
            return response

        except Exception as exc:
            process_time = time.time() - start_time
            logger.error(
                f"Unhandled Exception - ID: {request_id} | Exception: {str(exc)} | Duration: {process_time:.4f}s",
                exc_info=True
            )

            # Unified error response payload format
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error": {
                        "code": "INTERNAL_SERVER_ERROR",
                        "message": "An unexpected error occurred. Please try again later.",
                        "request_id": request_id
                    }
                }
            )
