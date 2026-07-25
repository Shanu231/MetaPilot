# MetaPilot Production Cloud Deployment Guide

This guide describes step-by-step instructions for deploying MetaPilot in a production cloud environment.

---

## 📖 Table of Contents
1. [Frontend Deployment (Vercel)](#1-frontend-deployment-vercel)
2. [Backend Deployment (Render)](#2-backend-deployment-render)
3. [Database Provisioning (PostgreSQL)](#3-database-provisioning-postgresql)
4. [Cache Provisioning (Redis)](#4-cache-provisioning-redis)
5. [Domain & SSL Setup](#5-domain--ssl-setup)
6. [Health Check Verification](#6-health-check-verification)
7. [Rollback Strategy](#7-rollback-strategy)

---

## 1. Frontend Deployment (Vercel)

The React/Vite application compiles into static files optimized for Vercel's Edge CDN.

1. Install the Vercel CLI locally or connect your GitHub repository to the Vercel Dashboard.
2. In the Vercel project configuration, set the following parameters:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (Root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Configure the environment variables in the Vercel Dashboard:
   - `VITE_API_URL`: The URL of your deployed backend service (e.g. `https://api.metapilot.io`).
4. Click **Deploy**. Vercel will build the React bundles and distribute them across their global edge network.

---

## 2. Backend Deployment (Render)

The FastAPI application can be deployed on Render using a Dockerized Web Service environment.

1. Ensure the backend repository contains a valid `Dockerfile` under the `backend/` directory.
2. Create a new **Web Service** on Render and connect your GitHub repository.
3. Configure the following service settings:
   - **Runtime**: `Docker`
   - **Root Directory**: `backend`
   - **Dockerfile Path**: `Dockerfile`
   - **Instance Type**: `Starter` (or higher, depending on your user load)
4. Set the backend environment variables under Render's **Environment** tab. (See the [Environment Variables Guide](file:///c:/Users/user/OneDrive/Desktop/MetaPilot/docs/EnvironmentVariables.md) for details).
5. Deploy the web service. Render will build the container and deploy it, exposing a public `onrender.com` URL.

---

## 3. Database Provisioning (PostgreSQL)

You can use Render PostgreSQL, AWS RDS, or Supabase to host your production PostgreSQL instance.

1. Provision a new PostgreSQL instance on your preferred database host (e.g. Render). Set the Postgres version to **15 or higher**.
2. Retrieve the external database connection string. Ensure it uses the async PG driver format:
   ```
   postgresql+asyncpg://[user]:[password]@[host]:[port]/[database]
   ```
3. Set this connection string as the value for `DATABASE_URL` in your Render Backend environment settings.
4. Ensure the database subnet allows incoming connection requests from Render's hosting CIDR blocks.

---

## 4. Cache Provisioning (Redis)

Redis manages rate limiting and caches API responses. You can use Render Redis or Upstash.

1. Provision a new Redis database container.
2. Copy the secure Redis URL:
   ```
   redis://:[password]@[host]:[port]/0
   ```
3. Save this value as the `REDIS_URL` in your Render Backend environment settings.

---

## 5. Domain & SSL Setup

### SSL Encryption
Both Vercel and Render automatically provision and renew **Let's Encrypt SSL/TLS certificates** for all deployed services. HTTPS is enforced by default.

### Custom Domains
1. **Frontend**: Add your custom domain (e.g. `metapilot.io`) in the Vercel project settings. Create a CNAME record in your DNS provider mapping to `cname.vercel-dns.com`.
2. **Backend**: Add your API custom subdomain (e.g. `api.metapilot.io`) in Render's settings. Add a CNAME record in your DNS provider mapping to the Render host name (e.g., `metapilot.onrender.com`).

---

## 6. Health Check Verification

Ensure that the deployment succeeded and that all integrations are connected:

1. Send an HTTP request to the backend health check endpoint:
   ```bash
   curl https://api.metapilot.io/api/vector/status
   ```
2. Verify that the response returns connectivity indicators:
   ```json
   {
     "status": "healthy",
     "database": "connected",
     "vector_store": "chromadb_active"
   }
   ```

---

## 7. Rollback Strategy

In the event of a critical issue in production:

### Frontend (Vercel)
1. Navigate to the **Deployments** tab on Vercel.
2. Select the previous stable deployment build.
3. Click the options menu and select **Instant Rollback**. Vercel will immediately redirect traffic to the old build.

### Backend (Render)
1. Go to the active Web Service on Render.
2. Select **Deployments**.
3. Choose the last working commit build, click the options menu, and select **Rollback to this deploy**. Render will deploy the container image matching that commit.
