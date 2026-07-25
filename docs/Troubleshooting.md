# MetaPilot Troubleshooting Guide

This document lists common exceptions, diagnostics, and remediation procedures for MetaPilot.

---

## 📖 Table of Contents
1. [Backend Installation Errors](#1-backend-installation-errors)
2. [DataHub GMS Connectivity Issues](#2-datahub-gms-connectivity-issues)
3. [LLM API Key Failures](#3-llm-api-key-failures)
4. [Vector Store & SQLite DB Locks](#4-vector-store--sqlite-db-locks)
5. [Redis Caching Exceptions](#5-redis-caching-exceptions)

---

## 1. Backend Installation Errors

### ChromaDB Compilation Failures
* **Symptom**: `pip install` fails when compiling `chromadb` or C++ build tools are requested.
* **Explanation**: ChromaDB requires specific build chains (like Visual C++ on Windows) to compile sqlite-hnsw dependencies.
* **Remediation**:
  1. If running locally, you can rely on the **SQLite Vector Store Fallback**. Open `backend/app/core/config.py` (or set the settings override) to allow Chroma DB to fail gracefully.
  2. Install Visual Studio Build Tools (C++ workloads) or install wheels directly.
  3. Alternatively, launch the backend via Docker to isolate dependencies:
     ```bash
     docker-compose up --build
     ```

### SentenceTransformers Download Lock
* **Symptom**: Server hangs at startup hook `seed_vector_index()`.
* **Explanation**: The library attempts to download `all-MiniLM-L6-v2` from Hugging Face, but the request blocks or times out.
* **Remediation**:
  1. Check your internet connection.
  2. Define environment properties to skip live downloads if offline, or manually pre-download the model files to the cache directory (`~/.cache/huggingface/hub`).

---

## 2. DataHub GMS Connectivity Issues

### GraphQL Endpoint Timeout
* **Symptom**: Backend logs show `GraphQL search failed` or `Connection timeout`.
* **Explanation**: The DataHub Generalized Metadata Service (GMS) is offline or running on a non-standard port.
* **Remediation**:
  1. Verify GMS is running on your network:
     ```bash
     curl http://localhost:8080/health
     ```
  2. If GMS is hosted on a different URL, update `DATAHUB_GMS_URL` in `backend/.env`.
  3. Rest assured that MetaPilot's **fallback mode** will seed mock Snowflake/Postgres schemas (`users_dim`, `orders_fact`, `stripe_webhook_events`) to allow full testing offline.

---

## 3. LLM API Key Failures

### Stream Error / API Key Missing
* **Symptom**: Queries return "Invalid API Key" or the server triggers simulated fallback responses.
* **Explanation**: `GEMINI_API_KEY` is undefined, expired, or invalid.
* **Remediation**:
  1. Verify the key is active in [Google AI Studio](https://aistudio.google.com/).
  2. Check that the key in `backend/.env` is formatted correctly, without extra spaces or double quotes:
     ```env
     GEMINI_API_KEY=AIzaSyA...
     ```
  3. Restart the FastAPI server after changing env files.

---

## 4. Vector Store & SQLite DB Locks

### Database is Locked Exception
* **Symptom**: `sqlite3.OperationalError: database is locked` logs.
* **Explanation**: Concurrent write operations are locking the SQLite DB fallback file.
* **Remediation**:
  1. Use SQLAlchemy's async connection pool to serialize write-backs.
  2. Remove the locked SQLite file `backend/metapilot.db` or `backend/vector_store.db` and restart the server to seed a clean copy.

---

## 5. Redis Caching Exceptions

### Redis Connection Refused
* **Symptom**: `ConnectionRefusedError: [Errno 111] Connect call failed`.
* **Explanation**: FastAPI is trying to connect to Redis for rate-limiting, but the Redis container is down.
* **Remediation**:
  1. Start the Redis server:
     ```bash
     docker-compose up -d redis
     ```
  2. If running without Redis, set `REDIS_URL=""` or configure fallback handlers. MetaPilot's middleware automatically handles Redis outages by logging a warning and bypassing rate restrictions.
