class IntegrationException(Exception):
    """Base exception class for all integrations module errors."""
    def __init__(self, message: str, code: str = "INTEGRATION_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)

class DataHubConnectionException(IntegrationException):
    """Raised when communication with DataHub GMS server fails."""
    def __init__(self, message: str = "Failed to communicate with DataHub GMS server."):
        super().__init__(message, code="DATAHUB_CONNECTION_ERROR")

class DataHubEntityNotFoundException(IntegrationException):
    """Raised when the requested metadata entity URN does not exist."""
    def __init__(self, urn: str):
        super().__init__(f"DataHub metadata entity URN not found: {urn}", code="DATAHUB_ENTITY_NOT_FOUND")

class CacheConnectionException(IntegrationException):
    """Raised when Redis caching operations fail."""
    def __init__(self, message: str = "Redis cache connection failed."):
        super().__init__(message, code="CACHE_CONNECTION_ERROR")
