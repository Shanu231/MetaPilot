from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.db import engine, Base
from app.middleware.logger_exception import LoggerExceptionMiddleware
from app.middleware.rate_limit import RateLimitMiddleware

# Routers
from app.api.endpoints import auth, users, system, metadata, ai, vector, automation

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="MetaPilot Enterprise Backend Platform Foundation Services",
    version="2.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json"
)

# CORS Policy configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount custom Logging/Exception mapping middleware
app.add_middleware(LoggerExceptionMiddleware)

# Mount custom Redis Rate Limiter middleware
app.add_middleware(RateLimitMiddleware)

# Register API Endpoint Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(system.router, prefix="/api/system", tags=["System Diagnostics"])
app.include_router(metadata.router, prefix="/api/metadata", tags=["Metadata Catalog"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI Engineering Agent"])
app.include_router(vector.router, prefix="/api/vector", tags=["Vector Store"])
app.include_router(automation.router, prefix="/api/automation", tags=["AI Engineering Automation"])

from app.ai.vector.indexer.metadata_indexer import metadata_indexer

@app.on_event("startup")
async def startup_event():
    # Seed database tables on local startup to ensure instant availability
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Initialize Persistent Vector Index and Chunkings
    await metadata_indexer.run_sync_indexing()

@app.get("/")
async def root_redirect():
    return {
        "project": settings.PROJECT_NAME,
        "status": "online",
        "documentation": "/docs"
    }
