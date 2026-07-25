# MetaPilot Developer Guide

This developer handbook details the technical architecture, layout rules, and development practices required for extending the MetaPilot platform.

---

## 📖 Table of Contents
1. [Codebase Organization](#1-codebase-organization)
2. [Frontend Architecture Standards](#2-frontend-architecture-standards)
3. [Backend Code Standards](#3-backend-code-standards)
4. [RAG Reasoning Pipeline Details](#4-rag-reasoning-pipeline-details)
5. [Database Migrations](#5-database-migrations)
6. [Testing & Quality Assurance](#6-testing--quality-assurance)

---

## 1. Codebase Organization

MetaPilot splits its frontend client static pages and backend server endpoints. For a detailed breakdown of all directories and file locations, consult the [Folder Structure Map](file:///c:/Users/user/OneDrive/Desktop/MetaPilot/docs/FolderStructure.md).

---

## 2. Frontend Architecture Standards

### Styling & CSS Tokens
* **Color System**: Never write ad-hoc hex values (e.g. `#FF0000`). All components must use the HSL variables declared in `src/index.css`.
  - Primary Theme: `hsl(var(--primary))`
  - Background: `hsl(var(--background))`
  - Card/Borders: `hsl(var(--card))` / `hsl(var(--border))`
* **Animations**: All interactive state transitions (dropdowns, tab switches, sidebar panels) must be animated using **Framer Motion** with smooth easing (e.g. `duration: 0.2`).
* **Icons**: Use **Lucide React** for all UI iconography to maintain visual consistency.

### State & APIs
* **JWT Token Storage**: User sessions are saved locally using `localStorage`. Attach tokens to HTTP request headers via a default Axios interceptor.
* **Server-Sent Events (SSE)**: Chat workspaces must process SSE streams chunk-by-chunk using custom text decoders to allow real-time code rendering.

---

## 3. Backend Code Standards

### Asynchronous Operations
- MetaPilot enforces non-blocking async operations. All route functions, database queries, cache checks, and API client requests must run using `async/await`.
- Database statements must utilize SQLAlchemy's async connection engine (`create_async_engine`).

### Logging & Diagnostics
- Log events must inherit from the `metapilot_backend` logging module.
- Do not use print statements (`print()`) in production code; utilize `logger.info`, `logger.warning`, or `logger.error` with contextual dictionary keys.

---

## 4. RAG Reasoning Pipeline Details

MetaPilot coordinates search queries across multiple vector collections.

```
                  ┌────────────────────────┐
                  │   User Prompt Query    │
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │   Embedding Service    │
                  │   (all-MiniLM-L6-v2)   │
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │ Semantic Retriever     │
                  │ (ChromaDB / SQLite)    │
                  └───────────┬────────────┘
                              │
            ┌─────────────────┴─────────────────┐
            ▼                                   ▼
┌────────────────────────┐          ┌────────────────────────┐
│  Metadata Filtering    │          │  Keyword Sim Boost     │
│ (Platform, Owner, Tag) │          │  (Fuzzy string matches)│
└───────────┬────────────┘          └───────────┬────────────┘
            └─────────────────┬─────────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │ Ranked Context Blocks  │
                  └────────────────────────┘
```

* **Offline Robustness**: If a host machine does not support native `chromadb` C-compilers, `ChromaDBManager` catches `ImportError` exceptions and redirects vector indexing to SQLite (`metapilot.db` and `vector_store.db`), calculating cosine similarity inside Python runtime threads.

---

## 5. Database Migrations

* Database migrations are managed via **Alembic**.
* To generate a new migration after updating SQLAlchemy model models:
  ```bash
  cd backend
  alembic revision --autogenerate -m "add_table_columns"
  ```
* To apply migrations to the active database:
  ```bash
  alembic upgrade head
  ```

---

## 6. Testing & Quality Assurance

### Pytest Suites
FastAPI backend endpoints are covered by tests under `backend/app/tests/`. To execute test tasks:
1. Navigate to the backend folder and activate your virtual env:
   ```bash
   cd backend
   pytest -v
   ```
2. Unit tests verify mock endpoints, JWT token authentication, RAG context fallbacks, and code generation parser functions.

### Code Verification Checks
Before submitting a PR, verify code formatting:
* **Python formatting**: Ensure code is formatted with `black`:
  ```bash
  black app/
  ```
* **Frontend quality**: Ensure Vite React compiles successfully:
  ```bash
  npm run build
  ```
