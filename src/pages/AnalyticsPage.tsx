import { useState } from "react";
import {
  TrendingUp,
  BarChart2,
  PieChart,
  Activity,
  Database,
  GitBranch
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { StatCard } from "../components/ui/StatCard";
import {
  mockMetadataGrowth,
  mockPlatformDistribution,
  mockUsageTrends,
  mockAssetHealthBreakdown
} from "../mock/analytics";
import { cn } from "../utils/cn";

export function AnalyticsPage() {
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const handlePointHover = (idx: number) => {
    setHoveredPointIndex(idx);
  };

  // Coordinates calculators for SVG growth area chart (6 points)
  // X: spacing of 100px. Y: ranges from datasetsCount (1100 to 1420). Scale to 120px height box.
  const chartHeight = 120;
  const chartWidth = 500;
  const paddingX = 40;
  const paddingY = 20;

  const points = mockMetadataGrowth.map((pt, idx) => {
    // scale 1100-1450 to 0-chartHeight
    const val = pt.datasetsCount;
    const minVal = 1000;
    const maxVal = 1500;
    const x = paddingX + (idx * (chartWidth - paddingX * 2)) / (mockMetadataGrowth.length - 1);
    const y = paddingY + chartHeight - paddingY * 2 - ((val - minVal) / (maxVal - minVal)) * (chartHeight - paddingY * 2);
    return { x, y, label: pt.month, value: val };
  });

  const pathD = `M ${points.map(p => `${p.x} ${p.y}`).join(" L ")}`;
  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  return (
    <div className="flex flex-col gap-6 text-white h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Analytics</h1>
          <p className="text-sm text-brand-muted mt-1">
            Data ecosystem health, ingestion trends, and growth indicators.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Telemetry Sync: Active</Badge>
        </div>
      </div>

      {/* Counter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Daily Query Volume"
          value="2,800"
          icon={<BarChart2 className="h-5 w-5 text-brand-secondary" />}
          trend={{ value: "+15% this week", direction: "up" }}
        />
        <StatCard
          title="Metadata Coverage"
          value="99.6%"
          icon={<Database className="h-5 w-5 text-brand-primary" />}
          trend={{ value: "+0.2% new descriptors", direction: "up" }}
        />
        <StatCard
          title="Lineage Linkages count"
          value="4,820 connections"
          icon={<GitBranch className="h-5 w-5 text-brand-accent" />}
          trend={{ value: "+120 mapped fields", direction: "up" }}
        />
      </div>

      {/* Main Charts grid workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SVG Area Chart: Metadata Catalog Growth */}
        <Card className="text-left flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-base font-bold font-heading flex items-center gap-2">
              <TrendingUp className="h-4 w-5 text-brand-primary" />
              Metadata Catalog Growth (Datasets)
            </h3>
            <span className="text-[10px] text-brand-muted uppercase font-bold tracking-wider">Last 6 Months</span>
          </div>

          <div className="mt-4 relative h-[160px] w-full">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4F46E5" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="white" strokeOpacity="0.03" strokeDasharray="3 3" />
              <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="white" strokeOpacity="0.03" strokeDasharray="3 3" />
              <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="white" strokeOpacity="0.05" />

              {/* Area fill */}
              <path d={areaD} fill="url(#area-gradient)" />
              {/* Line path */}
              <path d={pathD} fill="none" stroke="url(#line-gradient)" strokeWidth={3} className="transition-all" />

              {/* Points */}
              {points.map((pt, idx) => {
                const isHovered = hoveredPointIndex === idx;
                return (
                  <g key={idx}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 6 : 4}
                      fill={isHovered ? "#06B6D4" : "#4F46E5"}
                      stroke="#050816"
                      strokeWidth={1.5}
                      onMouseEnter={() => handlePointHover(idx)}
                      onMouseLeave={() => setHoveredPointIndex(null)}
                      className="cursor-pointer transition-all duration-100"
                    />
                    {/* Month Text label */}
                    <text x={pt.x} y={chartHeight - 4} fill="#9CA3AF" fontSize={8} textAnchor="middle" className="font-heading font-medium opacity-70">
                      {pt.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredPointIndex !== null && (
              <div
                className="absolute bg-black/90 border border-white/10 px-2 py-1 rounded text-[10px] text-white font-code pointer-events-none transform -translate-x-1/2 -translate-y-full z-10"
                style={{
                  left: `${(points[hoveredPointIndex].x / chartWidth) * 100}%`,
                  top: `${(points[hoveredPointIndex].y / chartHeight) * 100 - 10}px`
                }}
              >
                {points[hoveredPointIndex].value.toLocaleString()} tables
              </div>
            )}
          </div>
        </Card>

        {/* SVG Bar Chart: Weekly query activity trends */}
        <Card className="text-left flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-base font-bold font-heading flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-brand-secondary" />
              Weekly Usage activity Trends
            </h3>
            <span className="text-[10px] text-brand-muted uppercase font-bold tracking-wider">Weekly Queries</span>
          </div>

          <div className="mt-4 flex items-end justify-between h-[160px] px-4 w-full">
            {mockUsageTrends.map((trend, idx) => {
              // max count is 2800. Scale height to 120px.
              const maxVal = 3000;
              const barHeight = (trend.queriesCount / maxVal) * 120;
              const isHovered = hoveredBarIndex === idx;

              return (
                <div
                  key={trend.week}
                  className="flex flex-col items-center flex-1 cursor-pointer"
                  onMouseEnter={() => setHoveredBarIndex(idx)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                >
                  <div className="relative w-full flex justify-center">
                    {/* Animated hover value */}
                    {isHovered && (
                      <span className="absolute -top-7 bg-black/90 border border-white/10 px-1.5 py-0.5 rounded text-[9px] text-white font-code">
                        {trend.queriesCount.toLocaleString()}
                      </span>
                    )}

                    {/* SVG column bar */}
                    <div
                      className={cn(
                        "w-8 rounded-t-lg transition-all duration-300 relative overflow-hidden",
                        isHovered
                          ? "bg-gradient-to-t from-brand-primary to-brand-secondary shadow-glow-secondary"
                          : "bg-white/10"
                      )}
                      style={{
                        height: `${barHeight}px`
                      }}
                    >
                      {/* Active border accent */}
                      {isHovered && (
                        <div className="absolute top-0 inset-x-0 h-1 bg-brand-secondary" />
                      )}
                    </div>
                  </div>
                  <span className="text-[9px] text-brand-muted uppercase tracking-wider font-heading mt-2 block">
                    {trend.week}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Platform distribution Donut legend details */}
        <Card className="text-left flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-base font-bold font-heading flex items-center gap-2">
              <PieChart className="h-5 w-5 text-brand-accent" />
              Platform Database Distributions
            </h3>
            <span className="text-[10px] text-brand-muted uppercase font-bold tracking-wider">Asset volume</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 mt-4">
            {/* SVG custom Donut Chart */}
            <div className="relative w-32 h-32 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                {/* Background circle */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                {/* Snowflake segment - 42% */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#4F46E5" strokeWidth="3.2" strokeDasharray="42 58" strokeDashoffset="0" />
                {/* S3 segment - 20% */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#06B6D4" strokeWidth="3.2" strokeDasharray="20 80" strokeDashoffset="-42" />
                {/* Postgres segment - 18% */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#A855F7" strokeWidth="3.2" strokeDasharray="18 82" strokeDashoffset="-62" />
                {/* Airflow segment - 12% */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F59E0B" strokeWidth="3.2" strokeDasharray="12 88" strokeDashoffset="-80" />
                {/* dbt segment - 8% */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#EF4444" strokeWidth="3.2" strokeDasharray="8 92" strokeDashoffset="-92" />
              </svg>
              {/* Central badge text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center font-heading">
                <span className="text-lg font-bold text-white leading-none">1.4k</span>
                <span className="text-[8px] text-brand-muted uppercase mt-0.5 tracking-wider">Objects</span>
              </div>
            </div>

            {/* Legends list */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-xs">
              {mockPlatformDistribution.map((item, idx) => {
                const colors = ["bg-[#4F46E5]", "bg-[#06B6D4]", "bg-[#A855F7]", "bg-[#F59E0B]", "bg-[#EF4444]"];
                return (
                  <div key={item.platform} className="flex items-center gap-2 text-left justify-between sm:justify-start">
                    <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", colors[idx])} />
                    <span className="text-brand-muted truncate max-w-[120px]">{item.platform}</span>
                    <strong className="text-white ml-auto font-heading">{item.percentage}%</strong>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Ingestion Health logs */}
        <Card className="text-left flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-base font-bold font-heading flex items-center gap-2">
              <Activity className="h-5 w-5 text-brand-secondary" />
              Ingestion Health Breakdown
            </h3>
            <span className="text-[10px] text-brand-muted uppercase font-bold tracking-wider font-heading">Active</span>
          </div>

          <div className="flex flex-col gap-3.5 mt-4">
            {mockAssetHealthBreakdown.map((item) => (
              <div key={item.name} className="flex flex-col gap-1 text-left">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-white flex items-center gap-2">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        item.color === "emerald" && "bg-emerald-400 shadow-glow-primary",
                        item.color === "amber" && "bg-amber-400",
                        item.color === "rose" && "bg-rose-500 animate-pulse"
                      )}
                    />
                    {item.name}
                  </span>
                  <span className="text-brand-muted">{item.count} items ({((item.count / 1420) * 100).toFixed(1)}%)</span>
                </div>
                {/* Custom animated progress line */}
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      item.color === "emerald" && "bg-emerald-500",
                      item.color === "amber" && "bg-amber-500",
                      item.color === "rose" && "bg-rose-600"
                    )}
                    style={{
                      width: `${(item.count / 1420) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
