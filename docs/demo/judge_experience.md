# MetaPilot Hackathon Judge Onboarding Manual

This document provides testing instructions, prompts, and verification procedures for hackathon judges evaluating MetaPilot.

---

## 📖 Table of Contents
1. [Quick Start & Setup](#1-quick-start--setup)
2. [Step-by-Step Testing Flow](#2-step-by-step-testing-flow)
3. [Example Testing Prompts](#3-example-testing-prompts)
4. [Expected Output Verification](#4-expected-output-verification)
5. [Troubleshooting Checklist](#5-troubleshooting-checklist)

---

## 1. Quick Start & Setup

Ensure the application is running locally:
* **Frontend**: `http://localhost:5173`
* **Backend API**: `http://localhost:8000` (Swagger UI at `/docs`)

### Authentication Credentials
Log in with the default credentials:
- **Email**: `admin@metapilot.io`
- **Password**: `admin123`

---

## 2. Step-by-Step Testing Flow

### Step A: Enable Hackathon Judge Mode
To evaluate the RAG pipeline telemetry:
1. Navigate to **Settings** in the left sidebar menu.
2. Select the **Experimental Beta** tab.
3. Locate **Hackathon Judge Mode** and click the toggle switch to enable it.
4. Go back to the **Workspace** page. Note that the **Explainability Panel** on the right is now permanently expanded.

```
+───────────────────────────────────────+──────────────────────────+
│                                       │                          │
│                                       │   RAG Telemetry Panel    │
│            Workspace Chat             │   (Token Gauges,         │
│           & Code Editor               │    Latency Summaries,    │
│                                       │    System Prompts)       │
│                                       │                          │
+───────────────────────────────────────+──────────────────────────+
```

### Step B: Run Code Generation
Submit code generation prompts in the chat box on the left. The reasoning trace will stream into the chat, while the generated code blocks will render in the tabbed editor on the right.

### Step C: Audit Telemetry
Inspect the Explainability Panel on the right to view:
- **Token counts** (Prompt vs. Completion tokens).
- **Execution latency** (RAG query time, inference time, schema validation check time).
- **Schema Validation status** (confirming code contains no hallucinated tables/columns).
- **Export options** (downloading JSON diagnostic logs).

---

## 3. Example Testing Prompts

Use the following prompts to evaluate the agent's capabilities:

### SQL & dbt Generation
> *"Generate SQL to join raw stripe webhook events with production orders fact."*

### Lineage Impact Analysis
> *"What downstream tables will break if I modify the signup_date column in users_dim?"*

### Orchestration Pipelines
> *"Create a python Airflow TaskFlow DAG to run this daily."*

---

## 4. Expected Output Verification

### SQL Output Verification
Verify that the generated SQL:
* Correctly joins the Snowflake/Postgres tables based on schema attributes.
* Does not reference hallucinated tables.
* Example output shape:
  ```sql
  SELECT 
      u.user_id,
      u.email,
      o.order_id,
      o.amount_cents
  FROM analytics.prod.users_dim u
  JOIN analytics.prod.orders_fact o ON u.user_id = o.user_id;
  ```

### dbt Output Verification
Verify that the `dbt Config` tab displays a valid YAML structure:
```yaml
version: 2
models:
  - name: users_dim
    description: "Standardized user dimension table storing registered profile mappings..."
    columns:
      - name: user_id
        tests:
          - unique
          - not_null
```

### Airflow Output Verification
Verify that the `Airflow DAG` tab displays clean TaskFlow Python code:
```python
from airflow.decorators import dag, task
from datetime import datetime

@dag(schedule_interval='@daily', start_date=datetime(2026, 1, 1), catchup=False)
def metapilot_dataflow():
    @task
    def extract():
        # Extraction logic
        pass
```

---

## 5. Troubleshooting Checklist

If you encounter issues during evaluation:
* **LLM Connection Errors**: Verify that `GEMINI_API_KEY` is set correctly in `backend/.env`.
* **ChromaDB Errors**: If you encounter installation errors or missing wheels, MetaPilot will automatically switch to the **SQLite Fallback Database** using Python-calculated similarities. No action is required.
* **Database is Locked**: If the local SQLite file blocks writes, remove the lock files:
  ```bash
  rm backend/metapilot.db backend/vector_store.db
  ```
  Restart the backend server to reseed clean databases.
* For more detailed remediation steps, refer to [docs/Troubleshooting.md](file:///c:/Users/user/OneDrive/Desktop/MetaPilot/docs/Troubleshooting.md).
