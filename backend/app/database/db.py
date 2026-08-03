import logging
import socket
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

logger = logging.getLogger("metapilot_backend")

db_url = settings.DATABASE_URL
# Automatically fall back to SQLite if PostgreSQL on localhost is unreachable
if "localhost" in db_url or "127.0.0.1" in db_url:
    try:
        # Check if PostgreSQL default port 5432 is open
        with socket.create_connection(("127.0.0.1", 5432), timeout=1.0):
            logger.info("Local PostgreSQL instance detected. Connecting...")
    except Exception:
        logger.warning("Local PostgreSQL is unreachable. Falling back to local SQLite database: metapilot.db")
        db_url = "sqlite+aiosqlite:///metapilot.db"

# Configure database engine arguments
engine_args = {"echo": settings.DEBUG}
if not db_url.startswith("sqlite"):
    engine_args.update({
        "pool_size": 20,
        "max_overflow": 10,
        "pool_pre_ping": True
    })

engine = create_async_engine(db_url, **engine_args)

# Async Session maker
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False
)

class Base(DeclarativeBase):
    pass


# Async Dependency injector yielding active session transactions
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

