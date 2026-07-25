export interface PipelineRun {
  id: string;
  name: string;
  duration: string;
  status: "success" | "running" | "failed";
  timestamp: string;
  recordsProcessed: number;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  type: "meta" | "schema" | "lineage" | "ai";
}

export const mockPipelineRuns: PipelineRun[] = [
  { id: "run-1", name: "raw_postgres_sync", duration: "1m 45s", status: "success", timestamp: "5 mins ago", recordsProcessed: 12450 },
  { id: "run-2", name: "dbt_incremental_transform", duration: "4m 12s", status: "success", timestamp: "12 mins ago", recordsProcessed: 8432 },
  { id: "run-3", name: "s3_access_logs_parse", duration: "8s", status: "running", timestamp: "Active", recordsProcessed: 4329 },
  { id: "run-4", name: "tableau_cache_invalidate", duration: "25s", status: "failed", timestamp: "1 hour ago", recordsProcessed: 0 }
];

export const mockActivityLogs: ActivityLog[] = [
  { id: "log-1", user: "Alexander Wright", action: "modified column metadata notes on", target: "users_dim.email", timestamp: "15 mins ago", type: "meta" },
  { id: "log-2", user: "MetaPilot Agent", action: "rebuilt lineage dependencies mapping path for", target: "orders_fact", timestamp: "45 mins ago", type: "lineage" },
  { id: "log-3", user: "Sarah Jenkins", action: "published schema updates tag review to", target: "stripe_webhook_events", timestamp: "2 hours ago", type: "schema" },
  { id: "log-4", user: "MetaPilot Agent", action: "synthesized Airflow DAG deployment parameters script", target: "postgres_to_s3_ingestion.py", timestamp: "3 hours ago", type: "ai" }
];

export const mockSystemStatus = {
  healthScore: 98.4,
  activeAssets: 1420,
  successfulJobsPercentage: 99.1,
  datahubConnectionStatus: "connected",
  databaseSyncStatus: "synced 4 mins ago"
};

export const mockPinnedAssets = [
  { id: "asset-1", name: "users_dim", path: "analytics.prod.users_dim", platform: "snowflake", type: "table" },
  { id: "asset-2", name: "orders_fact", path: "analytics.prod.orders_fact", platform: "snowflake", type: "table" },
  { id: "asset-4", name: "orders_processing_pipeline", path: "pipelines.orders_processing_pipeline", platform: "airflow", type: "pipeline" }
];

export const mockFavoriteDatasets = [
  { id: "asset-1", name: "users_dim", queries: 1420 },
  { id: "asset-2", name: "orders_fact", queries: 3940 },
  { id: "asset-3", name: "stripe_webhook_events", queries: 420 }
];

export const mockRecentGeneratedFiles = [
  { id: "file-1", name: "monthly_signups_rolling.sql", type: "sql", time: "10 mins ago" },
  { id: "file-2", name: "postgres_to_s3_ingestion.py", type: "python", time: "3 hours ago" },
  { id: "file-3", name: "orders_fact_schema.yml", type: "yaml", time: "5 hours ago" }
];
