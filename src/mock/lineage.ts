export interface LineageNode {
  id: string;
  name: string;
  type: "table" | "view" | "pipeline" | "file" | "dashboard";
  platform: "snowflake" | "postgres" | "dbt" | "airflow" | "bigquery" | "s3";
  status: "healthy" | "degraded" | "failing";
  x: number;
  y: number;
  label: string;
  description: string;
}

export interface LineageEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
}

export const mockLineageNodes: LineageNode[] = [
  {
    id: "node-s3",
    name: "s3_raw_logs_bucket",
    type: "file",
    platform: "s3",
    status: "healthy",
    x: 50,
    y: 80,
    label: "s3://raw-dumps/logs",
    description: "Amazon S3 raw server telemetry bucket dump files."
  },
  {
    id: "node-pg",
    name: "stripe_webhook_events",
    type: "table",
    platform: "postgres",
    status: "degraded",
    x: 50,
    y: 280,
    label: "stripe_webhook_events",
    description: "Raw ledger PostgreSQL database schema webhook event inputs."
  },
  {
    id: "node-airflow",
    name: "orders_processing_pipeline",
    type: "pipeline",
    platform: "airflow",
    status: "healthy",
    x: 320,
    y: 180,
    label: "orders_processing_dag",
    description: "Airflow orchestration ingest and orchestrating dbt runs."
  },
  {
    id: "node-dbt",
    name: "dbt_transform_orders",
    type: "pipeline",
    platform: "dbt",
    status: "healthy",
    x: 580,
    y: 180,
    label: "dbt.models.orders_fact",
    description: "DBT analytical transformation scripts transforming webhooks."
  },
  {
    id: "node-users",
    name: "users_dim",
    type: "table",
    platform: "snowflake",
    status: "healthy",
    x: 840,
    y: 80,
    label: "analytics.users_dim",
    description: "Snowflake data warehouse dimension modeling for users."
  },
  {
    id: "node-orders",
    name: "orders_fact",
    type: "table",
    platform: "snowflake",
    status: "healthy",
    x: 840,
    y: 280,
    label: "analytics.orders_fact",
    description: "Snowflake data warehouse transaction facts table."
  },
  {
    id: "node-dashboard",
    name: "mrr_reporting_dashboard",
    type: "dashboard",
    platform: "snowflake",
    status: "healthy",
    x: 1100,
    y: 180,
    label: "Executive MRR Dashboard",
    description: "Downstream Tableau reports capturing rolling analytics data."
  }
];

export const mockLineageEdges: LineageEdge[] = [
  { id: "e-s3-airflow", source: "node-s3", target: "node-airflow", animated: true },
  { id: "e-pg-airflow", source: "node-pg", target: "node-airflow", animated: true },
  { id: "e-airflow-dbt", source: "node-airflow", target: "node-dbt", animated: true },
  { id: "e-dbt-users", source: "node-dbt", target: "node-users" },
  { id: "e-dbt-orders", source: "node-dbt", target: "node-orders" },
  { id: "e-users-dashboard", source: "node-users", target: "node-dashboard", animated: true },
  { id: "e-orders-dashboard", source: "node-orders", target: "node-dashboard", animated: true }
];
