import { useState } from "react";
import { FileCode, Download, FileText } from "lucide-react";
import { CodeBlock } from "../components/ui/CodeBlock";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useToast } from "../hooks/useToast";

interface GeneratedFile {
  id: string;
  name: string;
  lang: string;
  desc: string;
  code: string;
}

export function FilesPage() {
  const [activeFileId, setActiveFileId] = useState("file-sql");
  const { toast } = useToast();

  const mockFiles: GeneratedFile[] = [
    {
      id: "file-sql",
      name: "monthly_signups_rolling.sql",
      lang: "sql",
      desc: "PostgreSQL query computing daily user signups and rolling cumulative totals using window functions.",
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
    },
    {
      id: "file-python",
      name: "postgres_to_s3_ingestion.py",
      lang: "python",
      desc: "Python ETL script utilizing Airflow, pandas, and io buffers to sync raw PG tables directly to AWS S3 buckets in Parquet.",
      code: `from airflow import DAG
from airflow.providers.postgres.hooks.postgres import PostgresHook
from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta
import pandas as pd
import io

default_args = {
    'owner': 'data_platform_team',
    'start_date': datetime(2026, 1, 1),
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
}

def export_table_to_s3(table_name, bucket_name, s3_key):
    pg_hook = PostgresHook(postgres_conn_id='raw_postgres_server')
    connection = pg_hook.get_conn()
    df = pd.read_sql(f"SELECT * FROM {table_name}", connection)
    
    parquet_buffer = io.BytesIO()
    df.to_parquet(parquet_buffer, index=False)
    
    s3_hook = S3Hook(aws_conn_id='aws_s3_storage')
    s3_hook.load_file_obj(
        file_obj=parquet_buffer,
        key=s3_key,
        bucket_name=bucket_name,
        replace=True
    )
`
    },
    {
      id: "file-dbt",
      name: "stg_stripe_events.sql",
      lang: "sql",
      desc: "dbt staging SQL model using CTEs to filter and unpack JSON values from Stripe webhook events.",
      code: `WITH raw_events AS (
    SELECT * 
    FROM {{ source('stripe', 'stripe_webhook_events') }}
),

staged_events AS (
    SELECT
        event_id,
        event_type,
        CAST(payload->>'amount' AS INTEGER) AS amount_cents,
        CAST(payload->>'currency' AS VARCHAR) AS currency,
        ingested_at AS created_at
    FROM raw_events
)

SELECT * FROM staged_events;`
    },
    {
      id: "file-yaml",
      name: "schema.yml",
      lang: "yaml",
      desc: "dbt schema configuration detailing data testing constraints for primary keys and user relations checks.",
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
`
    }
  ];

  const activeFile = mockFiles.find((f) => f.id === activeFileId) || mockFiles[0];

  const handleDownload = () => {
    const blob = new Blob([activeFile.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      type: "success",
      title: "File Downloaded",
      message: `${activeFile.name} has been saved locally.`
    });
  };

  return (
    <div className="flex flex-col gap-6 text-white h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Generated Files</h1>
          <p className="text-sm text-brand-muted mt-1">
            Browse and extract scripts synthesized by MetaPilot agent operations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side: Sidebar Selection cards */}
        <div className="lg:col-span-1 flex flex-col gap-2">
          {mockFiles.map((file) => (
            <button
              key={file.id}
              onClick={() => setActiveFileId(file.id)}
              className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-3 group relative overflow-hidden ${
                file.id === activeFileId
                  ? "border-brand-primary/40 bg-brand-primary/10 text-white"
                  : "border-white/5 bg-white/[0.01] text-brand-muted hover:text-white hover:bg-white/5 hover:border-white/10"
              }`}
            >
              {/* Highlight bar indicator */}
              {file.id === activeFileId && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary" />
              )}
              <FileCode className={`h-5 w-5 shrink-0 ${file.id === activeFileId ? "text-brand-secondary animate-pulse" : "text-brand-muted"}`} />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold truncate block">{file.name}</span>
                <span className="text-[10px] text-brand-muted font-bold uppercase tracking-wider font-code mt-0.5">{file.lang}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Right Side: Code Preview Panel */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <Card className="text-left flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
              <div className="flex flex-col">
                <h3 className="text-lg font-bold font-heading flex items-center gap-2">
                  <FileText className="h-5 w-5 text-brand-secondary" />
                  Code Inspector
                </h3>
                <p className="text-xs text-brand-muted mt-1 leading-relaxed max-w-xl">
                  {activeFile.desc}
                </p>
              </div>
              <Button
                variant="glow"
                onClick={handleDownload}
                className="gap-2.5 text-xs font-semibold py-2 shrink-0 self-start sm:self-center"
              >
                <Download className="h-4 w-4 text-brand-secondary" />
                <span>Download File</span>
              </Button>
            </div>

            <div className="mt-2 w-full">
              <CodeBlock
                code={activeFile.code}
                language={activeFile.lang}
                filename={activeFile.name}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
