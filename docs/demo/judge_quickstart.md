# MetaPilot Judge Quick Start Manual

Follow these steps to demonstrate MetaPilot features to judges.

---

## 1. Quick Config Overview
- **Vite Client port**: `http://localhost:5173`
- **FastAPI Core server port**: `http://localhost:8000`

---

## 2. Walkthrough Steps

### Step 1: Login
1. Browse to `http://localhost:5173`.
2. Input credentials:
   - **Email**: `admin@metapilot.io`
   - **Password**: `admin123`
3. Click "Authenticate".

### Step 2: Configure Judge Mode
1. Click **Settings** in the left sidebar navigation pane.
2. Select the **Experimental Beta** tab.
3. Locate **Hackathon Judge Mode** and click the toggle switch to enable it.
4. Verify success notifications toast message.

### Step 3: Prompt Automation Code Generations
1. Go back to the **Workspace** page.
2. Notice the **Trust & Explainability** panel on the right side is automatically expanded.
3. Submit the query:
   - `"Generate SQL joining users and orders."`
4. Verify:
   - Output SQL shows in the split tabbed editor.
   - Explainability panel lists intent, latency breakdowns, and validation checks.
   - Click "Copy" or "Download" to save the files locally.
