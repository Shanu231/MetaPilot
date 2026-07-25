import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  Database,
  CheckCircle,
  Clock,
  Play,
  TrendingUp,
  FileCode,
  Star,
  Zap,
  ArrowRight,
  RefreshCw,
  GitBranch
} from "lucide-react";
import { StatCard } from "../components/ui/StatCard";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { useToast } from "../hooks/useToast";
import {
  mockPipelineRuns,
  mockActivityLogs,
  mockSystemStatus,
  mockFavoriteDatasets,
  mockRecentGeneratedFiles
} from "../mock/activity";

export function DashboardPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    toast({
      type: "info",
      title: "Metadata Ingestion Sync Initialized",
      message: "Syncing DataHub catalog metadata models..."
    });
    await new Promise((r) => setTimeout(r, 2000));
    setSyncing(false);
    toast({
      type: "success",
      title: "Catalog Synced Successfully",
      message: "Metadata explorer catalogs have been updated."
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 text-white"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Overview</h1>
          <p className="text-sm text-brand-muted mt-1">Live metrics and telemetry for your organization&apos;s data catalog.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleSync} isLoading={syncing} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${syncing && "animate-spin"}`} />
            <span>Sync Catalog</span>
          </Button>
          <Button variant="glow" onClick={() => navigate("/dashboard/workspace")} className="gap-2">
            <Zap className="h-4 w-4 text-brand-secondary" />
            <span>Launch Agent</span>
          </Button>
        </div>
      </div>

      {/* KPI stats section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Warehouse Health Score"
          value={`${mockSystemStatus.healthScore}%`}
          icon={<CheckCircle className="h-5 w-5 text-emerald-400" />}
          trend={{ value: "+0.4% from yesterday", direction: "up" }}
        />
        <StatCard
          title="Cataloged Data Assets"
          value={mockSystemStatus.activeAssets}
          icon={<Database className="h-5 w-5 text-brand-primary" />}
          trend={{ value: "+12 updated today", direction: "up" }}
        />
        <StatCard
          title="Workflow Success Rate"
          value={`${mockSystemStatus.successfulJobsPercentage}%`}
          icon={<Activity className="h-5 w-5 text-brand-secondary" />}
          trend={{ value: "All critical pipelines healthy", direction: "neutral" }}
        />
        <StatCard
          title="System Connection Status"
          value="DataHub Active"
          icon={<TrendingUp className="h-5 w-5 text-brand-accent" />}
          subtitle={mockSystemStatus.databaseSyncStatus}
        />
      </motion.div>

      {/* Grid workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Pipeline runs & activity timeline */}
        <motion.div variants={itemVariants} className="lg:col-span-2 flex flex-col gap-6">
          {/* Pipeline executions */}
          <Card>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold font-heading flex items-center gap-2">
                <Clock className="h-5 w-5 text-brand-primary" />
                Pipeline Activity Timeline
              </h3>
              <Badge variant="outline">Live Ingestion</Badge>
            </div>
            <div className="flex flex-col gap-3.5">
              {mockPipelineRuns.map((run) => (
                <div
                  key={run.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-white/5 text-brand-muted">
                      <Play className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col text-left min-w-0">
                      <span className="text-sm font-semibold text-white truncate">{run.name}</span>
                      <span className="text-xs text-brand-muted mt-0.5">
                        Processed {run.recordsProcessed.toLocaleString()} records • {run.duration}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-brand-muted font-medium">{run.timestamp}</span>
                    <Badge
                      variant={
                        run.status === "success"
                          ? "success"
                          : run.status === "running"
                          ? "info"
                          : "danger"
                      }
                      className="capitalize"
                    >
                      {run.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Activity timeline logs */}
          <Card>
            <h3 className="text-lg font-bold font-heading flex items-center gap-2 mb-5">
              <Activity className="h-5 w-5 text-brand-secondary" />
              Recent Operations Audits
            </h3>
            <div className="flex flex-col gap-4 relative pl-4 border-l border-white/5">
              {mockActivityLogs.map((log) => (
                <div key={log.id} className="relative flex flex-col items-start gap-1 text-left">
                  {/* Timeline point */}
                  <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-brand-primary border-2 border-brand-bg shadow-glow-primary" />
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{log.user}</span>
                    <span className="text-xs text-brand-muted">{log.action}</span>
                    <span className="text-xs font-semibold text-brand-secondary font-code">{log.target}</span>
                  </div>
                  <span className="text-[10px] text-brand-muted mt-0.5">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Right Side: Quick links, pinned, recent files */}
        <motion.div variants={itemVariants} className="flex flex-col gap-6">
          {/* Quick Actions */}
          <Card>
            <h3 className="text-lg font-bold font-heading flex items-center gap-2 mb-5">
              <Zap className="h-5 w-5 text-brand-accent" />
              Quick Actions
            </h3>
            <div className="flex flex-col gap-2.5">
              <Button
                variant="secondary"
                onClick={() => navigate("/dashboard/workspace")}
                className="justify-between w-full text-left"
              >
                <span>Write DBT Transformation Model</span>
                <ArrowRight className="h-4 w-4 text-brand-muted group-hover:text-white transition-colors" />
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate("/dashboard/metadata")}
                className="justify-between w-full text-left"
              >
                <span>Search Schema Fields & Tags</span>
                <ArrowRight className="h-4 w-4 text-brand-muted" />
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate("/dashboard/lineage")}
                className="justify-between w-full text-left"
              >
                <span>View Data Lineage Tree</span>
                <GitBranch className="h-4 w-4 text-brand-muted" />
              </Button>
            </div>
          </Card>

          {/* Favorite datasets */}
          <Card>
            <h3 className="text-lg font-bold font-heading flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-brand-secondary" />
              Favorite Datasets
            </h3>
            <div className="flex flex-col gap-2">
              {mockFavoriteDatasets.map((fav) => (
                <div
                  key={fav.id}
                  onClick={() => navigate(`/dashboard/metadata?asset=${fav.id}`)}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-white/0 hover:border-white/5 hover:bg-white/[0.02] transition-all cursor-pointer text-left"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-white truncate">{fav.name}</span>
                    <span className="text-xs text-brand-muted mt-0.5">{fav.queries} queries this month</span>
                  </div>
                  <Star className="h-4 w-4 text-brand-secondary fill-brand-secondary/20" />
                </div>
              ))}
            </div>
          </Card>

          {/* Recent files */}
          <Card>
            <h3 className="text-lg font-bold font-heading flex items-center gap-2 mb-4">
              <FileCode className="h-5 w-5 text-brand-primary" />
              Recent Generated Files
            </h3>
            <div className="flex flex-col gap-2">
              {mockRecentGeneratedFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => navigate("/dashboard/files")}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-all cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileCode className="h-4 w-4 text-brand-muted flex-shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-white truncate">{file.name}</span>
                      <span className="text-[10px] text-brand-muted font-medium uppercase font-code mt-0.5">{file.type}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-brand-muted">{file.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
