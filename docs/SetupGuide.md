# MetaPilot Local Setup & Installation Manual

This manual provides instructions for setting up the MetaPilot development environment on your local machine.

---

## 📖 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Backend Installation](#2-backend-installation)
3. [Database Initialization & Seeding](#3-database-initialization--seeding)
4. [Frontend Installation](#4-frontend-installation)
5. [Verification & First Steps](#5-verification--first-steps)

---

## 1. Prerequisites

Before installing, ensure your host environment contains the following tools:
* **Python (3.12 or higher)**: Required for the FastAPI server.
* **Node.js (v18.0.0 or higher)** & **npm**: Required for the React client.
* **Git**: To clone and manage repositories.
* **Docker & Docker Compose**: (Optional) For orchestrating PostgreSQL and Redis caches easily.

---

## 2. Backend Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   * **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   * **Windows (CMD)**:
     ```cmd
     .\venv\Scripts\activate.bat
     ```
   * **macOS / Linux**:
     ```bash
     source venv/bin/activate
     ```
4. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Create your local environment configuration:
   ```bash
   cp .env.example .env
   ```
6. Open `.env` and fill in the required parameters (especially `GEMINI_API_KEY` for live AI reasoning). See the [Environment Variables Guide](file:///c:/Users/user/OneDrive/Desktop/MetaPilot/docs/EnvironmentVariables.md) for details.

---

## 3. Database Initialization & Seeding

1. Start Postgres and Redis services. You can start them using the provided docker compose configuration:
   ```bash
   docker-compose up -d postgres redis
   ```
2. Apply database schemas. MetaPilot initializes schemas automatically at startup. If you need to seed the vector database fallback with mock DataHub schemas, run:
   ```bash
   python -m app.integrations.datahub.seed
   ```
   This populates the local SQLite vector database with schema attributes for `users_dim`, `orders_fact`, and `stripe_webhook_events`.

---

## 4. Frontend Installation

1. Navigate back to the project root directory:
   ```bash
   cd ..
   ```
2. Install the node packages:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. By default, the frontend app will start on:
   ```
   http://localhost:5173
   ```

---

## 5. Verification & First Steps

1. Start your backend server (if not already running):
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```
2. Browse to `http://localhost:5173`.
3. Log in with the default credentials:
   - **Email**: `admin@metapilot.io`
   - **Password**: `admin123`
4. Navigate to **Settings** and toggle **Hackathon Judge Mode** in the Experimental Beta tab to test RAG telemetry outputs.
5. Go to the **Workspace** tab and enter a test prompt:
   - `"Write a SQL join query for Snowflake users and orders."`
6. Verify that the AI streams the reasoning trace, generates the correct SQL block, and populates the telemetry measurements in the explainability panel on the right.
