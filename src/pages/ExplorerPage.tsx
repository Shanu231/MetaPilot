import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Database,
  Search,
  FolderOpen,
  Folder,
  Tag,
  User,
  Clock,
  ChevronDown,
  Eye,
  HelpCircle,
  Loader2
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { metadataApi, type DatahubEntity } from "../api/metadata";
import { cn } from "../utils/cn";

export function ExplorerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [datasets, setDatasets] = useState<DatahubEntity[]>([]);
  const [activeUrn, setActiveUrn] = useState<string>("");
  const [activeAsset, setActiveAsset] = useState<DatahubEntity | null>(null);
  const [filterQuery, setFilterQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"schema" | "preview" | "stats">("schema");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    snowflake: true,
    postgres: true,
    s3: false
  });

  // Fetch initial datasets
  useEffect(() => {
    const fetchDatasets = async () => {
      setLoadingList(true);
      try {
        const list = await metadataApi.getDatasets();
        setDatasets(list);
        
        // Find default active URN
        const queryUrn = searchParams.get("asset");
        if (queryUrn) {
          setActiveUrn(queryUrn);
        } else if (list.length > 0) {
          setActiveUrn(list[0].urn);
        }
      } catch (err) {
        console.error("Failed to load catalog datasets: ", err);
      } finally {
        setLoadingList(false);
      }
    };
    fetchDatasets();
  }, []);

  // Fetch active asset details when activeUrn shifts
  useEffect(() => {
    if (!activeUrn) return;
    const fetchDetails = async () => {
      setLoadingDetails(true);
      try {
        const details = await metadataApi.getEntity(activeUrn);
        setActiveAsset(details);
      } catch (err) {
        console.error("Failed to fetch entity details: ", err);
      } finally {
        setLoadingDetails(false);
      }
    };
    fetchDetails();
  }, [activeUrn]);

  // Sync state from query parameters if exists
  useEffect(() => {
    const assetUrn = searchParams.get("asset");
    if (assetUrn && assetUrn !== activeUrn) {
      setActiveUrn(assetUrn);
    }
    const searchVal = searchParams.get("search");
    if (searchVal) {
      setFilterQuery(decodeURIComponent(searchVal));
    }
  }, [searchParams]);

  const toggleFolder = (folderKey: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderKey]: !prev[folderKey]
    }));
  };

  const getFilteredAssets = () => {
    const q = filterQuery.toLowerCase().trim();
    if (!q) return datasets;
    return datasets.filter((a) => a.name.toLowerCase().includes(q) || a.urn.toLowerCase().includes(q));
  };

  const filteredAssets = getFilteredAssets();

  // Group filtered assets by platform type for tree organization
  const groupedAssets = filteredAssets.reduce((acc, asset) => {
    const plat = asset.platform;
    if (!acc[plat]) acc[plat] = [];
    acc[plat].push(asset);
    return acc;
  }, {} as Record<string, DatahubEntity[]>);

  // Custom mock data preview lines for tables
  const mockTablePreviews: Record<string, any[]> = {
    "users_dim": [
      { user_id: "usr_94301", email: "user_a34@gmail.com", signup_date: "2026-07-24 10:00:23", status: "active" },
      { user_id: "usr_82094", email: "bob.jenkins@yahoo.com", signup_date: "2026-07-24 09:42:12", status: "active" },
      { user_id: "usr_42019", email: "sarah_90@hotmail.com", signup_date: "2026-07-23 18:30:00", status: "suspended" }
    ],
    "orders_fact": [
      { order_id: "ch_st_9843", user_id: "usr_94301", amount_cents: 4900, currency: "USD", created_at: "2026-07-24 10:05:00" },
      { order_id: "ch_st_4209", user_id: "usr_82094", amount_cents: 12000, currency: "CAD", created_at: "2026-07-24 09:44:00" }
    ],
    "stripe_webhook_events": [
      { event_id: "evt_3901a", event_type: "charge.succeeded", payload: '{"id":"ch_st_9843","amount":4900}', ingested_at: "2026-07-24 10:05:01" },
      { event_id: "evt_4209b", event_type: "charge.succeeded", payload: '{"id":"ch_st_4209","amount":1200}', ingested_at: "2026-07-24 09:44:02" }
    ]
  };

  const previewKey = activeAsset?.name || "";
  const currentPreviewData = mockTablePreviews[previewKey] || [];

  return (
    <div className="flex flex-col gap-6 text-white h-full">
      {/* Breadcrumbs / Search Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Metadata Explorer</h1>
          <p className="text-sm text-brand-muted mt-1">
            Catalog navigation for datasets, transformation models, and warehouse assets.
          </p>
        </div>
      </div>

      <div className="h-[calc(100vh-14rem)] flex border border-white/5 rounded-2xl overflow-hidden glass">
        {/* Left column tree panel */}
        <div className="w-72 border-r border-white/5 flex flex-col shrink-0 bg-white/[0.005]">
          <div className="p-4 border-b border-white/5">
            <Input
              id="explorer-search"
              placeholder="Search assets..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3.5">
            {loadingList ? (
              <div className="flex flex-col gap-3 p-2">
                <Loader2 className="h-5 w-5 animate-spin text-brand-primary mx-auto" />
                <span className="text-[10px] text-brand-muted uppercase text-center font-heading font-semibold">Loading Catalogs...</span>
              </div>
            ) : (
              Object.entries(groupedAssets).map(([platform, items]) => (
                <div key={platform} className="flex flex-col text-left">
                  <button
                    onClick={() => toggleFolder(platform)}
                    className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-brand-muted hover:text-white uppercase tracking-wider font-heading w-full"
                  >
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transform transition-transform duration-200",
                        !expandedFolders[platform] && "-rotate-90"
                      )}
                    />
                    {expandedFolders[platform] ? (
                      <FolderOpen className="h-3.5 w-3.5 text-brand-primary" />
                    ) : (
                      <Folder className="h-3.5 w-3.5 text-brand-primary" />
                    )}
                    <span>{platform} ({items.length})</span>
                  </button>

                  {expandedFolders[platform] && (
                    <div className="flex flex-col gap-0.5 mt-1.5 pl-4 border-l border-white/5 ml-3.5">
                      {items.map((item) => (
                        <button
                          key={item.urn}
                          onClick={() => {
                            setActiveUrn(item.urn);
                            setSearchParams({ asset: item.urn });
                          }}
                          className={cn(
                            "px-3 py-2 rounded-lg text-xs font-medium text-left truncate transition-colors flex items-center gap-2",
                            item.urn === activeUrn
                              ? "bg-white/10 text-white font-semibold"
                              : "text-brand-muted hover:text-white hover:bg-white/5"
                          )}
                        >
                          <Database className="h-3.5 w-3.5 opacity-70 flex-shrink-0" />
                          <span className="truncate">{item.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}

            {!loadingList && filteredAssets.length === 0 && (
              <div className="text-center py-8 text-brand-muted text-xs">
                No catalogs match search parameters.
              </div>
            )}
          </div>
        </div>

        {/* Right column details inspector panel */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#050816]/10 overflow-y-auto">
          {loadingDetails ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-brand-secondary mb-3" />
              <span className="text-sm text-brand-muted font-heading font-semibold">Synchronizing schemas from GMS registry...</span>
            </div>
          ) : activeAsset ? (
            <>
              {/* Top catalog header */}
              <div className="p-6 border-b border-white/5 bg-white/[0.01] text-left">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="primary" className="uppercase font-code text-[10px]">
                    {activeAsset.platform}
                  </Badge>
                  <Badge variant="success" className="capitalize">
                    Active
                  </Badge>
                  <span className="text-xs text-brand-muted ml-auto font-heading flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Updated 2 hours ago
                  </span>
                </div>

                <h2 className="text-2xl font-bold font-heading mt-2">{activeAsset.name}</h2>
                <code className="text-xs text-brand-secondary mt-1 block font-code truncate max-w-full">{activeAsset.urn}</code>
                <p className="text-sm text-brand-muted mt-3 leading-relaxed max-w-3xl">
                  {activeAsset.description}
                </p>

                <div className="flex flex-wrap gap-4 mt-5 text-xs text-brand-muted font-medium">
                  <span className="flex items-center gap-1.5">
                    <User className="h-4 w-4 text-brand-primary" />
                    Owner: <strong className="text-white">{activeAsset.owner || "Metadata Team"}</strong>
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-4">
                  {(activeAsset.tags || []).map((tag) => (
                    <Badge key={tag} variant="outline" className="flex items-center gap-1">
                      <Tag className="h-2.5 w-2.5" />
                      <span>#{tag}</span>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* View Tab selectors */}
              <div className="px-6 border-b border-white/5 bg-white/[0.005] flex items-center justify-between shrink-0">
                <div className="flex gap-4">
                  {(["schema", "preview", "stats"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "py-3.5 px-1.5 text-xs font-semibold uppercase tracking-wider font-heading border-b-2 transition-all",
                        activeTab === tab
                          ? "border-brand-primary text-white"
                          : "border-transparent text-brand-muted hover:text-white"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab content panel */}
              <div className="p-6 flex-1 text-left">
                {activeTab === "schema" && (
                  <div className="flex flex-col">
                    {activeAsset.fields && activeAsset.fields.length > 0 ? (
                      <div className="border border-white/5 rounded-xl overflow-hidden glass">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-brand-muted uppercase bg-white/5 font-heading">
                            <tr>
                              <th className="px-4 py-3">Field</th>
                              <th className="px-4 py-3">Type</th>
                              <th className="px-4 py-3">Nullable</th>
                              <th className="px-4 py-3">Description</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {activeAsset.fields.map((field) => (
                              <tr key={field.name} className="hover:bg-white/[0.01] transition-colors">
                                <td className="px-4 py-3.5 font-semibold text-white font-code">{field.name}</td>
                                <td className="px-4 py-3.5 text-brand-secondary font-code text-xs">{field.type}</td>
                                <td className="px-4 py-3.5">
                                  {field.nullable ? (
                                    <span className="text-brand-muted text-xs">YES</span>
                                  ) : (
                                    <Badge variant="outline" className="text-[9px] border-rose-500/20 text-rose-400">NO</Badge>
                                  )}
                                </td>
                                <td className="px-4 py-3.5 text-brand-muted text-xs max-w-sm leading-relaxed">{field.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-brand-muted border border-white/5 border-dashed rounded-xl">
                        <HelpCircle className="h-8 w-8 mx-auto opacity-30 mb-2" />
                        <span>Schema definitions are not available for unstructured pipeline files.</span>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "preview" && (
                  <div className="flex flex-col">
                    {currentPreviewData.length > 0 ? (
                      <div className="border border-white/5 rounded-xl overflow-hidden glass overflow-x-auto">
                        <table className="w-full text-sm text-left min-w-[600px]">
                          <thead className="text-xs text-brand-muted uppercase bg-white/5 font-heading">
                            <tr>
                              {Object.keys(currentPreviewData[0]).map((key) => (
                                <th key={key} className="px-4 py-3 font-code">{key}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 font-code text-xs">
                            {currentPreviewData.map((row, idx) => (
                              <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                                {Object.values(row).map((val: any, cellIdx) => (
                                  <td key={cellIdx} className="px-4 py-3 text-white truncate max-w-[200px]">
                                    {typeof val === "object" ? JSON.stringify(val) : String(val)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-brand-muted border border-white/5 border-dashed rounded-xl">
                        <Eye className="h-8 w-8 mx-auto opacity-30 mb-2" />
                        <span>Sample data preview is not enabled for unstructured pipeline workflows.</span>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "stats" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="flex flex-col justify-center text-left py-4 px-5">
                      <span className="text-[10px] text-brand-muted uppercase tracking-wider font-semibold">Queries last 30d</span>
                      <span className="text-3xl font-bold font-heading text-brand-secondary mt-1">1,240</span>
                      <span className="text-xs text-emerald-400 mt-2 font-medium">+15% week-over-week</span>
                    </Card>
                    <Card className="flex flex-col justify-center text-left py-4 px-5">
                      <span className="text-[10px] text-brand-muted uppercase tracking-wider font-semibold">Metadata Completeness</span>
                      <span className="text-3xl font-bold font-heading text-white mt-1">100%</span>
                      <span className="text-xs text-brand-muted mt-2">All column descriptors cataloged</span>
                    </Card>
                    <Card className="flex flex-col justify-center text-left py-4 px-5">
                      <span className="text-[10px] text-brand-muted uppercase tracking-wider font-semibold">Upstream Dependencies</span>
                      <span className="text-3xl font-bold font-heading text-brand-accent mt-1">2 Upstreams</span>
                      <span className="text-xs text-brand-muted mt-2">1 platform ingestion DAG</span>
                    </Card>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-brand-muted text-sm font-semibold">
              Select a catalog dataset to inspect metadata attributes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
