import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Database, FileCode, Sliders, MessageSquare, Terminal, History, CornerDownLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { mockAssets } from "../../mock/assets";
import { cn } from "../../utils/cn";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [history, setHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem("metapilot-search-history");
    return saved ? JSON.parse(saved) : ["users_dim", "airflow", "lineage"];
  });

  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle keys: Up, Down, Enter, Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, filteredResults.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredResults[activeIndex]) {
          handleSelect(filteredResults[activeIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeIndex, query]);

  // Keep active item in view inside scroll container
  useEffect(() => {
    if (resultsRef.current) {
      const activeEl = resultsRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        const container = resultsRef.current;
        const activeTop = activeEl.offsetTop;
        const activeBottom = activeTop + activeEl.offsetHeight;
        const containerTop = container.scrollTop;
        const containerBottom = containerTop + container.offsetHeight;

        if (activeTop < containerTop) {
          container.scrollTop = activeTop;
        } else if (activeBottom > containerBottom) {
          container.scrollTop = activeBottom - container.offsetHeight;
        }
      }
    }
  }, [activeIndex]);

  const handleSelect = (item: any) => {
    // Add to history
    const queryTerm = item.name || item.label;
    if (queryTerm) {
      const updated = [queryTerm, ...history.filter((h) => h !== queryTerm)].slice(0, 5);
      setHistory(updated);
      localStorage.setItem("metapilot-search-history", JSON.stringify(updated));
    }

    onClose();
    if (item.route) {
      navigate(item.route);
    } else if (item.type === "table" || item.type === "view" || item.type === "file") {
      navigate(`/dashboard/metadata?asset=${item.id}`);
    } else if (item.type === "pipeline") {
      navigate("/dashboard/lineage");
    }
  };

  // Commands + Navigation options
  const commands = [
    { id: "cmd-workspace", name: "Open AI Chat Workspace", category: "Navigation", route: "/dashboard/workspace", icon: <MessageSquare className="h-4 w-4" /> },
    { id: "cmd-explorer", name: "Explore Metadata Catalog", category: "Navigation", route: "/dashboard/metadata", icon: <Database className="h-4 w-4" /> },
    { id: "cmd-lineage", name: "View Data Lineage Graph", category: "Navigation", route: "/dashboard/lineage", icon: <Terminal className="h-4 w-4" /> },
    { id: "cmd-files", name: "Browse Generated Files", category: "Navigation", route: "/dashboard/files", icon: <FileCode className="h-4 w-4" /> },
    { id: "cmd-settings", name: "Configure MetaPilot Settings", category: "Navigation", route: "/dashboard/settings", icon: <Sliders className="h-4 w-4" /> }
  ];

  // Match inputs
  const getFilteredResults = () => {
    const term = query.trim().toLowerCase();

    // If search term is empty, show recent history + standard commands
    if (!term) {
      return [
        ...history.map((hist) => ({
          id: `hist-${hist}`,
          name: hist,
          category: "Recent Searches",
          isHistory: true,
          route: `/dashboard/metadata?search=${encodeURIComponent(hist)}`
        })),
        ...commands
      ];
    }

    // Filter mock assets and command list
    const assetsMatch = mockAssets
      .filter((a) => a.name.toLowerCase().includes(term) || a.description.toLowerCase().includes(term))
      .map((a) => ({
        ...a,
        category: "Assets catalog",
        icon: <Database className="h-4 w-4 text-brand-secondary" />
      }));

    const commandsMatch = commands.filter((c) => c.name.toLowerCase().includes(term));

    return [...commandsMatch, ...assetsMatch];
  };

  const filteredResults = getFilteredResults();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] p-4">
          {/* Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Palette Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-2xl glass rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col relative z-10 max-h-[500px]"
          >
            {/* Input bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-white/5 gap-3 bg-white/[0.01]">
              <Search className="h-5 w-5 text-brand-muted flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search assets, schemas, pipelines, templates, commands..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                className="w-full bg-transparent text-white placeholder-brand-muted text-sm border-0 focus:ring-0 focus:outline-none"
              />
              <div className="flex-shrink-0 flex items-center gap-1 bg-white/5 border border-white/5 px-2 py-0.5 rounded text-[10px] text-brand-muted font-bold">
                <span>ESC</span>
              </div>
            </div>

            {/* Results */}
            <div
              ref={resultsRef}
              className="flex-1 overflow-y-auto p-2 min-h-[150px] flex flex-col gap-0.5"
            >
              {filteredResults.length > 0 ? (
                filteredResults.map((item: any, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={cn(
                        "w-full px-3 py-2.5 rounded-xl cursor-pointer flex items-center justify-between transition-colors duration-150",
                        isActive ? "bg-white/10 text-white" : "text-brand-muted hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex-shrink-0 opacity-70">
                          {item.isHistory ? <History className="h-4 w-4" /> : item.icon || <Terminal className="h-4 w-4" />}
                        </div>
                        <div className="flex flex-col text-left min-w-0">
                          <span className="text-sm font-medium text-white truncate">
                            {item.name}
                          </span>
                          {item.path && (
                            <span className="text-xs text-brand-muted truncate font-code mt-0.5">
                              {item.path}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-brand-muted uppercase font-semibold tracking-wider bg-white/5 border border-white/5 px-1.5 py-0.5 rounded">
                          {item.category || item.type}
                        </span>
                        {isActive && <CornerDownLeft className="h-3 w-3 text-brand-secondary" />}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center text-brand-muted">
                  <Terminal className="h-8 w-8 opacity-30 mb-2" />
                  <p className="text-sm font-heading font-medium">No results found for &ldquo;{query}&rdquo;</p>
                  <p className="text-xs mt-1">Try searching for &lsquo;users_dim&rsquo;, &lsquo;dbt&rsquo;, or dashboard navigation pages.</p>
                </div>
              )}
            </div>

            {/* Footer tips */}
            <div className="px-4 py-2.5 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-[11px] text-brand-muted">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="bg-white/5 px-1 rounded">↑↓</span> Move
                </span>
                <span className="flex items-center gap-1">
                  <span className="bg-white/5 px-1 rounded">Enter</span> Select
                </span>
              </div>
              <span>MetaPilot Command Center</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
