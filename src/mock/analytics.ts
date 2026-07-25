export interface GrowthPoint {
  month: string;
  datasetsCount: number;
  pipelinesCount: number;
}

export interface PlatformDistribution {
  platform: string;
  count: number;
  percentage: number;
}

export interface UsageTrend {
  week: string;
  queriesCount: number;
  aiSessionsCount: number;
}

export const mockMetadataGrowth: GrowthPoint[] = [
  { month: "Feb", datasetsCount: 1100, pipelinesCount: 42 },
  { month: "Mar", datasetsCount: 1150, pipelinesCount: 45 },
  { month: "Apr", datasetsCount: 1220, pipelinesCount: 49 },
  { month: "May", datasetsCount: 1300, pipelinesCount: 54 },
  { month: "Jun", datasetsCount: 1380, pipelinesCount: 60 },
  { month: "Jul", datasetsCount: 1420, pipelinesCount: 64 }
];

export const mockPlatformDistribution: PlatformDistribution[] = [
  { platform: "Snowflake", count: 596, percentage: 42 },
  { platform: "AWS S3", count: 284, percentage: 20 },
  { platform: "Postgres", count: 256, percentage: 18 },
  { platform: "Apache Airflow", count: 170, percentage: 12 },
  { platform: "dbt Projects", count: 114, percentage: 8 }
];

export const mockUsageTrends: UsageTrend[] = [
  { week: "Wk 24", queriesCount: 1450, aiSessionsCount: 120 },
  { week: "Wk 25", queriesCount: 1680, aiSessionsCount: 145 },
  { week: "Wk 26", queriesCount: 1980, aiSessionsCount: 190 },
  { week: "Wk 27", queriesCount: 2200, aiSessionsCount: 210 },
  { week: "Wk 28", queriesCount: 2450, aiSessionsCount: 280 },
  { week: "Wk 29", queriesCount: 2800, aiSessionsCount: 340 }
];

export const mockAssetHealthBreakdown = [
  { name: "Healthy Assets", count: 1392, color: "emerald" },
  { name: "Degraded Performance", count: 22, color: "amber" },
  { name: "Failing Runs/Pipelines", count: 6, color: "rose" }
];
