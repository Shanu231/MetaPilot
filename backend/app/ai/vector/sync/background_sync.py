import asyncio
import logging
from app.ai.vector.indexer.metadata_indexer import metadata_indexer

logger = logging.getLogger("metapilot_backend")

class BackgroundSyncWorker:
    def __init__(self):
        self.sync_task = None

    def start_scheduled_sync(self, interval_seconds: int = 86400):
        """Spins up a recurring background loop syncing DataHub catalog changes."""
        async def loop():
            while True:
                try:
                    logger.info("BackgroundSyncWorker: Running scheduled index updates...")
                    await metadata_indexer.run_sync_indexing()
                except Exception as e:
                    logger.warning(f"BackgroundSyncWorker: Job execution failed: {e}")
                await asyncio.sleep(interval_seconds)

        self.sync_task = asyncio.create_task(loop())
        logger.info(f"BackgroundSyncWorker: Scheduled loop started with interval of {interval_seconds}s.")

# Global single instance coordinator
sync_worker = BackgroundSyncWorker()
