# MetaPilot Configuration & Environment Variables

This document lists the environment variables used by the MetaPilot FastAPI application. 

---

## Configuration File

The backend application reads environment settings from the `backend/.env` file. A sample template is provided below.

```env
# ==============================================================================
# METAPILOT CORE SETTINGS
# ==============================================================================
PRIMARY_AI_PROVIDER=gemini
SECRET_KEY=9a15a0c8b671f654b4d7f52554d3cd25121e428c057639bd2d9e03d3c8c5c7d1
ACCESS_TOKEN_EXPIRE_MINUTES=60
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW_SECONDS=60

# ==============================================================================
# DATABASE SETTINGS
# ==============================================================================
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/metapilot
REDIS_URL=redis://localhost:6379/0

# ==============================================================================
# VECTOR DATABASE SETTINGS
# ==============================================================================
CHROMADB_PERSIST_PATH=./chroma_db

# ==============================================================================
# THIRD-PARTY INTEGRATION APIS
# ==============================================================================
GEMINI_API_KEY=AIzaSyA1...your_gemini_api_key...
DATAHUB_GMS_URL=http://localhost:8080
DATAHUB_PAT_TOKEN=your_datahub_personal_access_token
```

---

## Detailed Variable Reference

### Core Application Properties

#### `PRIMARY_AI_PROVIDER`
- **Description**: Designates which LLM endpoint is active for completion and embedding.
- **Allowed Values**: `gemini`, `openai`, `groq`
- **Default**: `gemini`
- **Notes**: If set to `gemini` but `GEMINI_API_KEY` is missing, the application automatically triggers offline reasoning simulation mode.

#### `SECRET_KEY`
- **Description**: The cryptographic signature key used for sign/decode hashing of user JWT session tokens.
- **Allowed Values**: String (high-entropy hex recommended)
- **Default**: Randomly generated value
- **Security Warning**: Replace the default value in production deployments.

#### `ACCESS_TOKEN_EXPIRE_MINUTES`
- **Description**: The lifespan in minutes of user session tokens before re-authentication is required.
- **Default**: `60`

#### `RATE_LIMIT_REQUESTS` / `RATE_LIMIT_WINDOW_SECONDS`
- **Description**: Configures API request limits per IP address to prevent brute-force attacks and abuse.
- **Default**: `100` requests per `60` seconds.

---

### Database Configurations

#### `DATABASE_URL`
- **Description**: The connection string for the main SQL storage database.
- **Format**: `postgresql+asyncpg://[user]:[password]@[host]:[port]/[db_name]`
- **Default**: `postgresql+asyncpg://postgres:postgres@localhost:5432/metapilot`
- **Notes**: MetaPilot uses asynchronous drivers (`asyncpg`) to achieve non-blocking query processing.

#### `REDIS_URL`
- **Description**: Connection string for Redis caching, rate-limiting counters, and session store.
- **Format**: `redis://[host]:[port]/[database]`
- **Default**: `redis://localhost:6379/0`
- **Notes**: If Redis is unreachable, the system logs a warning and disables rate limiting.

---

### Vector DB Configurations

#### `CHROMADB_PERSIST_PATH`
- **Description**: The filesystem directory where the persistent vector store database files are written.
- **Default**: `./chroma_db` (inside the `backend/` folder)

---

### Ingestions & AI API Credentials

#### `GEMINI_API_KEY`
- **Description**: API key for Google Gemini model access.
- **Notes**: Obtain a key from the Google AI Studio console.

#### `DATAHUB_GMS_URL`
- **Description**: The REST and GraphQL endpoint for LinkedIn DataHub's Generalized Metadata Service (GMS).
- **Default**: `http://localhost:8080`
- **Notes**: MetaPilot verifies server health at start. If connection timeouts occur, it activates the fallback mock catalog.

#### `DATAHUB_PAT_TOKEN`
- **Description**: DataHub Personal Access Token (PAT) required for GMS calls.
- **Notes**: Leave empty if your local DataHub environment does not have metadata authorization activated.
