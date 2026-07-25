export interface Field {
  name: string;
  type: string;
  isKey: boolean;
  description: string;
  nullable: boolean;
}

export interface DataAsset {
  id: string;
  name: string;
  type: "table" | "view" | "pipeline" | "file" | "dashboard";
  path: string;
  platform: "snowflake" | "postgres" | "dbt" | "airflow" | "bigquery" | "s3";
  owner: string;
  description: string;
  tags: string[];
  fields?: Field[];
  status: "healthy" | "degraded" | "failing";
  lastUpdated: string;
  rowCount?: number;
  sizeBytes?: number;
  queriesCount?: number;
}

export const mockAssets: DataAsset[] = [
  {
    id: "asset-1",
    name: "users_dim",
    type: "table",
    path: "analytics.prod.users_dim",
    platform: "snowflake",
    owner: "Data Platform Team",
    description: "Core dimensions table for all registered users, combining account metadata and status profiles.",
    tags: ["core", "pii", "dimension"],
    status: "healthy",
    lastUpdated: "2026-07-24 10:42",
    rowCount: 1250320,
    sizeBytes: 254820110,
    queriesCount: 1420,
    fields: [
      { name: "user_id", type: "VARCHAR(64)", isKey: true, description: "Primary Key. Unique identifier of the user account.", nullable: false },
      { name: "email", type: "VARCHAR(256)", isKey: false, description: "Hashed user email address.", nullable: false },
      { name: "signup_date", type: "TIMESTAMP", isKey: false, description: "Timestamp when the user registered.", nullable: false },
      { name: "country_code", type: "VARCHAR(3)", isKey: false, description: "ISO 3-letter country code of user.", nullable: true },
      { name: "status", type: "VARCHAR(32)", isKey: false, description: "Current account status (active, suspended, deleted).", nullable: false },
      { name: "updated_at", type: "TIMESTAMP", isKey: false, description: "Record update timestamp.", nullable: false }
    ]
  },
  {
    id: "asset-2",
    name: "orders_fact",
    type: "table",
    path: "analytics.prod.orders_fact",
    platform: "snowflake",
    owner: "Finance Analytics Team",
    description: "Fact table recording all payment transaction records and orders details processed through Stripe.",
    tags: ["financials", "transactions", "facts"],
    status: "healthy",
    lastUpdated: "2026-07-24 11:30",
    rowCount: 8432094,
    sizeBytes: 1548201200,
    queriesCount: 3940,
    fields: [
      { name: "order_id", type: "VARCHAR(64)", isKey: true, description: "Primary Key. Stripe transaction order ID.", nullable: false },
      { name: "user_id", type: "VARCHAR(64)", isKey: false, description: "Foreign key reference to users_dim.", nullable: false },
      { name: "amount_cents", type: "INTEGER", isKey: false, description: "Total checkout volume in cents.", nullable: false },
      { name: "currency", type: "VARCHAR(3)", isKey: false, description: "ISO 3-letter currency currency.", nullable: false },
      { name: "status", type: "VARCHAR(32)", isKey: false, description: "Status code of transactions (completed, refunded, pending).", nullable: false },
      { name: "created_at", type: "TIMESTAMP", isKey: false, description: "Transaction processing timestamp.", nullable: false }
    ]
  },
  {
    id: "asset-3",
    name: "stripe_webhook_events",
    type: "table",
    path: "raw.stripe.stripe_webhook_events",
    platform: "postgres",
    owner: "DevOps Integration Team",
    description: "Raw ledger ingest representing raw json payloads received from Stripe webhook subscriptions.",
    tags: ["raw", "ingest"],
    status: "degraded",
    lastUpdated: "2026-07-24 11:45",
    rowCount: 20124900,
    sizeBytes: 10423984120,
    queriesCount: 420,
    fields: [
      { name: "event_id", type: "VARCHAR(128)", isKey: true, description: "Unique event identifier from publisher.", nullable: false },
      { name: "event_type", type: "VARCHAR(64)", isKey: false, description: "E.g., charge.succeeded, customer.created.", nullable: false },
      { name: "payload", type: "JSON", isKey: false, description: "Raw JSON content metadata received.", nullable: false },
      { name: "ingested_at", type: "TIMESTAMP", isKey: false, description: "Ingestion service timestamp.", nullable: false }
    ]
  },
  {
    id: "asset-4",
    name: "orders_processing_pipeline",
    type: "pipeline",
    path: "pipelines.orders_processing_pipeline",
    platform: "airflow",
    owner: "Data Platform Team",
    description: "Airflow DAG orchestrating raw webhooks ingestion, DBT models transformation, and analytical fact load.",
    tags: ["orchestration", "critical", "dbt"],
    status: "healthy",
    lastUpdated: "2026-07-24 08:00",
    queriesCount: 0
  },
  {
    id: "asset-5",
    name: "mrr_reporting_dashboard",
    type: "dashboard",
    path: "dashboards.mrr_reporting",
    platform: "snowflake",
    owner: "Finance Analytics Team",
    description: "Executive Tableau dashboard capturing Monthly Recurring Revenue (MRR), churn rate and cohorts metrics.",
    tags: ["executive", "mrr", "tableau"],
    status: "healthy",
    lastUpdated: "2026-07-24 09:30",
    queriesCount: 520
  },
  {
    id: "asset-6",
    name: "dbt_transform_orders",
    type: "pipeline",
    path: "dbt.models.orders_fact",
    platform: "dbt",
    owner: "Data Platform Team",
    description: "DBT incremental transformation model transforming raw webhook data to finance transactions.",
    tags: ["transformation", "incremental"],
    status: "healthy",
    lastUpdated: "2026-07-24 11:20"
  },
  {
    id: "asset-7",
    name: "s3_raw_logs_bucket",
    type: "file",
    path: "s3://metapilot-raw-dumps/logs",
    platform: "s3",
    owner: "DevOps Integration Team",
    description: "AWS S3 storage bucket retaining daily server telemetry, logs dumps and request headers in Parquet format.",
    tags: ["raw", "s3", "parquet"],
    status: "healthy",
    lastUpdated: "2026-07-24 11:00",
    rowCount: 450122900,
    sizeBytes: 154820120300
  }
];
