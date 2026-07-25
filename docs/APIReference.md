# MetaPilot REST API Specifications & Reference Manual

Lists routes and payload parameter details for MetaPilot endpoints.

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/register`
Creates user login profile.
- **Request Body**:
  ```json
  {
    "email": "dev@metapilot.io",
    "password": "password123",
    "name": "Jane Developer"
  }
  ```

### `POST /api/auth/login`
Returns login JWT token payload.
- **Request Body**:
  ```json
  {
    "username": "dev@metapilot.io",
    "password": "password123"
  }
  ```

---

## 2. Metadata Catalog Endpoints (`/api/metadata`)

### `GET /api/metadata/search`
Queries DataHub entity profiles.
- **Query Params**: `query=users_dim`

### `GET /api/metadata/lineage`
Traverses lineage links.
- **Query Params**: `urn=urn:li:dataset:...`

---

## 3. Vector Database Endpoints (`/api/vector`)

### `GET /api/vector/status`
Verifies ChromaDB persistent client connectivity.

### `POST /api/vector/reindex`
Schedules search index sync updates.

---

## 4. Engineering Automation Endpoints (`/api/automation`)

### `POST /api/automation/generate`
Generates transformed model files.
- **Request Body**:
  ```json
  {
    "artifact_type": "sql|dbt|airflow",
    "urn": "urn:li:dataset:..."
  }
  ```
