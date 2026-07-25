import { useState, useEffect } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RefreshCw,
  GitBranch,
  ArrowRight,
  Database,
  Loader2
} from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { useToast } from "../hooks/useToast";
import { metadataApi } from "../api/metadata";
import { cn } from "../utils/cn";

export function LineagePage() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("");
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const loadLineage = async () => {
      setLoading(true);
      try {
        const data = await metadataApi.getLineage("all");
        setNodes(data.nodes);
        setEdges(data.edges);
        if (data.nodes.length > 0) {
          setSelectedNodeId(data.nodes[0].id);
        }
      } catch (err) {
        console.error("Failed to load lineage DAG relations: ", err);
      } finally {
        setLoading(false);
      }
    };
    loadLineage();
  }, []);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  // Mouse pan handlers for the canvas
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".lineage-node")) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (factor: number) => {
    setZoomScale((prev) => Math.max(0.5, Math.min(2, prev * factor)));
  };

  const resetCanvas = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    toast({
      type: "info",
      message: "Canvas layout has been reset to default coordinates."
    });
  };

  // Check if edge is connected to hovered node (to highlight path)
  const isEdgeHighlighted = (source: string, target: string) => {
    if (!hoveredNodeId) return true;
    return source === hoveredNodeId || target === hoveredNodeId;
  };

  // Check if node is connected to hovered node
  const isNodeDimmed = (nodeId: string) => {
    if (!hoveredNodeId) return false;
    if (nodeId === hoveredNodeId) return false;

    // Check direct neighbors
    const connected = edges.some(
      (e) =>
        (e.source === hoveredNodeId && e.target === nodeId) ||
        (e.target === hoveredNodeId && e.source === nodeId)
    );
    return !connected;
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-white h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-brand-secondary mb-3" />
        <span className="text-sm text-brand-muted font-heading font-semibold">Resolving DataHub lineage relationships...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-white h-full relative">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Data Lineage</h1>
          <p className="text-sm text-brand-muted mt-1">
            Visual dependency mapping of raw webhook ingests down to BI reporting dashboard assets.
          </p>
        </div>
      </div>

      <div
        className={cn(
          "grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-14rem)] overflow-hidden",
          isFullscreen && "fixed inset-0 z-50 p-6 bg-brand-bg h-screen w-screen"
        )}
      >
        {/* Left Side: SVG Visual Graph Canvas */}
        <div className="lg:col-span-3 border border-white/5 rounded-2xl relative bg-[#040714] overflow-hidden flex flex-col glass shadow-2xl">
          {/* Top Panel toolbar */}
          <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/5 p-1.5 rounded-xl shadow-lg">
            <button
              onClick={() => handleZoom(1.1)}
              className="p-2 text-brand-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleZoom(0.9)}
              className="p-2 text-brand-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={resetCanvas}
              className="p-2 text-brand-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              title="Reset View"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <div className="w-[1px] h-4 bg-white/5 my-1" />
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-brand-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>

          <div className="absolute top-4 right-4 z-30 bg-black/40 backdrop-blur-md border border-white/5 px-3 py-1.5 rounded-xl shadow-lg text-xs text-brand-muted flex items-center gap-3">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Healthy</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Degraded</span>
            <span className="flex items-center gap-1 animate-pulse"><span className="w-2 h-2 rounded-full bg-brand-primary" /> Active Stream</span>
          </div>

          {/* SVG Canvas Workspace */}
          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={cn(
              "flex-1 relative cursor-grab select-none overflow-hidden",
              isDragging && "cursor-grabbing"
            )}
          >
            {/* SVG Background Grid Pattern */}
            <div
              className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-20"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
                transformOrigin: "0 0"
              }}
            />

            {/* Transform Group wraps nodes and lines */}
            <div
              className="absolute inset-0 origin-center transition-transform duration-75"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`
              }}
            >
              {/* SVG Connector Edges */}
              <svg className="absolute inset-0 w-[2000px] h-[1000px] pointer-events-none z-10">
                <defs>
                  <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4F46E5" />
                    <stop offset="50%" stopColor="#06B6D4" />
                    <stop offset="100%" stopColor="#A855F7" />
                  </linearGradient>
                  {/* Arrow markers for edges */}
                  <marker
                    id="arrow"
                    viewBox="0 0 10 10"
                    refX="26"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#374151" />
                  </marker>
                  <marker
                    id="arrow-active"
                    viewBox="0 0 10 10"
                    refX="26"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#06B6D4" />
                  </marker>
                </defs>

                {edges.map((edge) => {
                  const srcNode = nodes.find((n) => n.id === edge.source);
                  const tgtNode = nodes.find((n) => n.id === edge.target);

                  if (!srcNode || !tgtNode) return null;

                  // Node layout coordinates (middle offsets)
                  const x1 = srcNode.x + 100;
                  const y1 = srcNode.y + 35;
                  const x2 = tgtNode.x + 100;
                  const y2 = tgtNode.y + 35;

                  // Draw elegant Bezier curves instead of straight lines
                  const controlX1 = x1 + 100;
                  const controlY1 = y1;
                  const controlX2 = x2 - 100;
                  const controlY2 = y2;
                  const pathD = `M ${x1} ${y1} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${x2} ${y2}`;

                  const isHigh = isEdgeHighlighted(edge.source, edge.target);
                  const isAct = edge.animated;

                  return (
                    <g key={edge.id}>
                      {/* Base connection pipeline */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={isHigh ? (isAct ? "url(#edge-gradient)" : "#1f2937") : "#111827"}
                        strokeWidth={isHigh ? 2.5 : 1}
                        markerEnd={isHigh && isAct ? "url(#arrow-active)" : "url(#arrow)"}
                        className="transition-all duration-300"
                      />
                      {/* High-fidelity active flow dots streaming */}
                      {isHigh && isAct && (
                        <path
                          d={pathD}
                          fill="none"
                          stroke="#06B6D4"
                          strokeWidth={2.5}
                          strokeDasharray="8 12"
                          className="animate-[shimmer_20s_infinite_linear]"
                          style={{
                            strokeDashoffset: 100
                          }}
                        />
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* HTML Nodes overlay */}
              <div className="absolute inset-0 w-[2000px] h-[1000px] pointer-events-auto z-20">
                {nodes.map((node) => {
                  const isDimmed = isNodeDimmed(node.id);
                  const isSel = node.id === selectedNodeId;

                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      className={cn(
                        "lineage-node absolute w-52 h-[70px] rounded-xl glass border p-3 cursor-pointer flex flex-col justify-between hover:shadow-lg transition-all duration-200",
                        isSel ? "border-brand-secondary shadow-glow-secondary bg-[#111827]/90" : "border-white/5 bg-[#111827]/75",
                        isDimmed ? "opacity-30" : "opacity-100"
                      )}
                      style={{
                        left: node.x,
                        top: node.y
                      }}
                    >
                      <div className="flex items-center justify-between min-w-0">
                        <span className="text-[10px] text-brand-muted uppercase font-bold tracking-wider font-heading block">
                          {node.platform}
                        </span>
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full",
                            node.status === "healthy"
                              ? "bg-emerald-400 shadow-glow-primary"
                              : node.status === "degraded"
                              ? "bg-amber-400 animate-pulse"
                              : "bg-rose-500 animate-ping"
                          )}
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-1 min-w-0">
                        <Database className="h-4 w-4 text-brand-secondary shrink-0" />
                        <span className="text-xs font-semibold text-white truncate text-left w-full">
                          {node.name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Minimap Widget */}
          <div className="absolute bottom-4 left-4 z-30 bg-black/50 border border-white/5 p-2 rounded-xl backdrop-blur-md shadow-lg hidden sm:block">
            <span className="text-[9px] uppercase tracking-wider font-semibold text-brand-muted block text-left">Mini Map</span>
            <div className="w-24 h-16 relative bg-[#040714] rounded border border-white/5 mt-1 overflow-hidden">
              {nodes.map((node) => (
                <span
                  key={node.id}
                  className={cn(
                    "absolute w-1.5 h-1 rounded-sm bg-white/30",
                    node.id === selectedNodeId && "bg-brand-secondary"
                  )}
                  style={{
                    left: `${(node.x / 1300) * 100}%`,
                    top: `${(node.y / 400) * 100}%`
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Details Inspector Drawer Panel */}
        <div className="lg:col-span-1 border border-white/5 rounded-2xl p-6 glass flex flex-col justify-between text-left shadow-2xl h-full overflow-y-auto">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2 border-b border-white/5 pb-4">
              <GitBranch className="h-5 w-5 text-brand-secondary" />
              <h3 className="text-lg font-bold font-heading">Asset Inspector</h3>
            </div>

            <div className="flex flex-col gap-1.5">
              <Badge variant="primary" className="uppercase w-fit text-[10px] font-code">
                {selectedNode.platform}
              </Badge>
              <h4 className="text-xl font-bold font-heading text-white mt-1">
                {selectedNode.name}
              </h4>
              <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                {selectedNode.description}
              </p>
            </div>

            <div className="flex flex-col gap-3 mt-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wider">Node parameters</span>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-brand-muted">System type:</span>
                <span className="font-semibold text-white capitalize">{selectedNode.type}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-brand-muted">Active health:</span>
                <span
                  className={cn(
                    "font-semibold",
                    selectedNode.status === "healthy" ? "text-emerald-400" : "text-amber-400"
                  )}
                >
                  {selectedNode.status === "healthy" ? "100% Healthy" : "Degraded Performance"}
                </span>
              </div>
            </div>

            {/* Upstream/Downstream nodes counts */}
            <div className="flex flex-col gap-2.5 mt-2">
              <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wider">Lineage connections</span>
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-white/5 bg-white/[0.01]">
                <div className="flex-1 text-center">
                  <span className="text-[10px] text-brand-muted uppercase block">Upstreams</span>
                  <span className="text-lg font-bold text-white font-heading mt-0.5">
                    {edges.filter((e) => e.target === selectedNodeId).length}
                  </span>
                </div>
                <div className="w-[1px] h-6 bg-white/5" />
                <div className="flex-1 text-center">
                  <span className="text-[10px] text-brand-muted uppercase block">Downstreams</span>
                  <span className="text-lg font-bold text-white font-heading mt-0.5">
                    {edges.filter((e) => e.source === selectedNodeId).length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full text-xs font-semibold mt-6 flex items-center justify-between"
            onClick={() => toast({ type: "info", message: `Opening schema explorer page for ${selectedNode.name}` })}
          >
            <span>View Full Schema details</span>
            <ArrowRight className="h-4.5 w-4.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
