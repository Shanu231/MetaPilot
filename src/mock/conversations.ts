export interface Message {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
  codeBlock?: {
    language: string;
    code: string;
    filename: string;
  };
}

export interface Conversation {
  id: string;
  title: string;
  pinned: boolean;
  messages: Message[];
  lastUpdated: string;
}

export const mockSuggestedPrompts = [
  "Explain data lineage of users_dim table",
  "Write an Airflow DAG for ingesting Postgres tables",
  "Generate dbt schema files for orders_fact",
  "Locate PII datasets across my Snowflake warehouse",
  "Optimize querying performance on stripe_webhook_events"
];

export const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    title: "SQL generation for signups",
    pinned: true,
    lastUpdated: "10 mins ago",
    messages: [
      {
        id: "msg-1-1",
        sender: "user",
        content: "Hey MetaPilot, can you generate a Postgres SQL query to track rolling signup user metrics for the current month?",
        timestamp: "10:30 AM"
      },
      {
        id: "msg-1-2",
        sender: "assistant",
        content: "Here is a PostgreSQL query utilizing window functions to compute rolling signup counts and daily cumulative users for the current month:",
        timestamp: "10:31 AM",
        codeBlock: {
          language: "sql",
          filename: "monthly_signups_rolling.sql",
          code: `SELECT 
  signup_date::date AS day,
  COUNT(user_id) AS daily_signups,
  SUM(COUNT(user_id)) OVER (
    ORDER BY signup_date::date 
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS cumulative_signups
FROM analytics.prod.users_dim
WHERE signup_date >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY 1
ORDER BY 1 ASC;`
        }
      }
    ]
  },
  {
    id: "conv-2",
    title: "users_dim Lineage Mapping",
    pinned: false,
    lastUpdated: "1 hour ago",
    messages: [
      {
        id: "msg-2-1",
        sender: "user",
        content: "Explain where the data inside users_dim comes from.",
        timestamp: "9:15 AM"
      },
      {
        id: "msg-2-2",
        sender: "assistant",
        content: "According to the DataHub metadata catalog, the `users_dim` table is updated incrementally via an Airflow workflow (`orders_processing_pipeline`). It consolidates staging tables from the raw database, specifically `stripe_webhook_events` (for user profiles and metadata billing updates) and user telemetry data stored in Amazon S3 buckets.",
        timestamp: "9:16 AM"
      }
    ]
  }
];

export const mockResponses: { keywords: string[]; answer: string; codeBlock?: { language: string; filename: string; code: string } }[] = [
  {
    keywords: ["lineage", "users_dim"],
    answer: "The table `users_dim` has a clear upstream lineage. It is populated by `orders_processing_pipeline` in Airflow, which pulls raw records from `stripe_webhook_events` (PostgreSQL) and parses them into analytical profiles. Downstream, it feeds the `mrr_reporting_dashboard` and downstream cohort query models.",
  },
  {
    keywords: ["airflow", "dag", "postgres"],
    answer: "Sure! Below is a production-grade Apache Airflow DAG demonstrating ingestion of raw PostgreSQL schemas and loading into Amazon S3 in Parquet formatting:",
    codeBlock: {
      language: "python",
      filename: "postgres_to_s3_ingestion.py",
      code: `from airflow import DAG
from airflow.providers.postgres.hooks.postgres import PostgresHook
from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta
import pandas as pd
import io

default_args = {
    'owner': 'data_platform_team',
    'depends_on_past': False,
    'start_date': datetime(2026, 1, 1),
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
}

def export_table_to_s3(table_name, bucket_name, s3_key):
    # Retrieve PG connection
    pg_hook = PostgresHook(postgres_conn_id='raw_postgres_server')
    connection = pg_hook.get_conn()
    
    # Run fetch query
    df = pd.read_sql(f"SELECT * FROM {table_name}", connection)
    
    # Store df as parquet buffer
    parquet_buffer = io.BytesIO()
    df.to_parquet(parquet_buffer, index=False)
    
    # Stream to AWS S3 bucket
    s3_hook = S3Hook(aws_conn_id='aws_s3_storage')
    s3_hook.load_file_obj(
        file_obj=parquet_buffer,
        key=s3_key,
        bucket_name=bucket_name,
        replace=True
    )

with DAG(
    'postgres_raw_ingest_dag',
    default_args=default_args,
    schedule_interval='@daily',
    catchup=False,
    tags=['ingest', 'raw', 's3']
) as dag:

    ingest_stripe_events = PythonOperator(
        task_id='ingest_stripe_webhook_events',
        python_callable=export_table_to_s3,
        op_kwargs={
            'table_name': 'raw.stripe.stripe_webhook_events',
            'bucket_name': 'metapilot-raw-dumps',
            's3_key': 'raw_events/stripe_events_{{ ds }}.parquet'
        }
    )
`
    }
  },
  {
    keywords: ["dbt", "schema", "orders_fact"],
    answer: "Here is the recommended DBT configuration schema `.yml` mapping for the `orders_fact` model inside the analytics layer. This includes references, primary key constraint checks, and relationships checks:",
    codeBlock: {
      language: "yaml",
      filename: "schema.yml",
      code: `version: 2

models:
  - name: orders_fact
    description: "Transaction facts mapping checkout events from Stripe database tables."
    tests:
      - dbt_utils.unique_combination_of_columns:
          combination_of_columns:
            - order_id
            
    columns:
      - name: order_id
        description: "Primary key of Stripe transaction checkout."
        tests:
          - unique
          - not_null

      - name: user_id
        description: "Foreign key mapping back to users dimension table."
        tests:
          - not_null
          - relationships:
              to: ref('users_dim')
              field: user_id

      - name: amount_cents
        description: "Gross payment total collected (stored in cents)."
        tests:
          - not_null
`
    }
  },
  {
    keywords: ["pii", "locate", "snowflake"],
    answer: "We scanned the connected metadata models. There are **2 tables containing active PII tags**:\n\n1. `analytics.prod.users_dim` has column `email` flagged with `#pii-hashed` tag.\n2. `raw.stripe.stripe_webhook_events` has a `payload` JSON field containing raw address metadata details.\n\nRecommendation: Enable dynamic column masking policies on Snowflake databases for the email column field.",
  }
];

export const getSimulatedResponse = (input: string) => {
  const normalized = input.toLowerCase();
  for (const resp of mockResponses) {
    if (resp.keywords.every((kw) => normalized.includes(kw))) {
      return resp;
    }
  }
  return {
    answer: `I analyzed your search for "${input}". Here's a brief synthesis based on our schema catalogs:\n\nThe current data warehouse catalog contains references matching this search within the Snowflake database analytical schemas. To run further operations or create workflows (like DBT or Airflow pipelines), select a template or specify the operation details. Let me know how I can assist with writing transformation models, building lineage graphs, or checking schema ownership!`,
    codeBlock: {
      language: "sql",
      filename: "custom_metapilot_query.sql",
      code: `SELECT *
FROM analytics.prod.users_dim u
LEFT JOIN analytics.prod.orders_fact o ON u.user_id = o.user_id
LIMIT 100;`
    }
  };
};
