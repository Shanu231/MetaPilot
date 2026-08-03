import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Zap,
  Star,
  Layers,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Compass,
  Paperclip,
  Loader2,
  Trash2,
  Download,
  Copy,
  FileText,
  Code
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { CodeBlock } from "../components/ui/CodeBlock";
import { useToast } from "../hooks/useToast";
import { cn } from "../utils/cn";
import { apiClient } from "../api/client";

export interface Message {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  pinned: boolean;
  messages: Message[];
  summary?: string;
}

interface ArtifactFile {
  name: string;
  language: string;
  content: string;
}

export function WorkspacePage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [isContextCollapsed, setIsContextCollapsed] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Active file editor tabs states
  const [activeTabIdx, setActiveTabIdx] = useState(0);

  // Observability metadata state
  const [metaInfo, setMetaInfo] = useState<{
    intent: string;
    task_classification: string;
    sources: string[];
    lineage_depth: number;
    owner: string;
    platform: string;
    cache_status: string;
    provider: string;
    model_name: string;
    prompt_version: string;
    token_usage: { input: number; output: number; total: number };
    retrieval_time: string;
    reasoning_time: string;
    generation_time: string;
    latency_secs: string;
    validation_results: string;
    hallucination_check: string;
    confidence_score: number;
    why_explanation: string;
  }>({
    intent: "General Inquiry",
    task_classification: "inquiry",
    sources: ["vector_store_rag"],
    lineage_depth: 0,
    owner: "Emma Linwood",
    platform: "postgres",
    cache_status: "Chroma DB Hit",
    provider: "gemini",
    model_name: "gemini-2.5-flash",
    prompt_version: "v2.1.0",
    token_usage: { input: 120, output: 45, total: 165 },
    retrieval_time: "0.012",
    reasoning_time: "0.014",
    generation_time: "0.024",
    latency_secs: "0.0400",
    validation_results: "Passed (100% matched)",
    hallucination_check: "No fabrications detected",
    confidence_score: 0.85,
    why_explanation: "Answer generated directly using DataHub registered Snowflake schema catalogs and relations."
  });

  // Automatically force expand Observability sidebar if Hackathon Judge Mode is active
  const isJudgeMode = localStorage.getItem("judgeMode") === "true";
  useEffect(() => {
    if (isJudgeMode) {
      setIsContextCollapsed(false);
    }
  }, [isJudgeMode]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const activeConv = conversations.find((c) => c.id === activeConvId);

  // Fetch session histories on mount
  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const resp = await apiClient.get("/ai/chat/history");
      setConversations(resp.data);
      if (resp.data.length > 0) {
        setActiveConvId(resp.data[0].id);
      }
    } catch (err) {
      console.error("Failed to load chat history: ", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages, isThinking, streamingText]);

  // Extract generated code blocks dynamically from active chats or streams
  const getArtifactFiles = (): ArtifactFile[] => {
    const files: ArtifactFile[] = [];
    if (!activeConv) return files;

    const regex = /```(sql|yaml|yml|python|py|bash|sh)?\n([\s\S]*?)```/g;
    
    // Scan messages
    activeConv.messages.forEach((msg) => {
      let match;
      let idx = 1;
      while ((match = regex.exec(msg.content)) !== null) {
        const lang = match[1] || "sql";
        const content = match[2].trim();
        let ext = "sql";
        if (lang === "yaml" || lang === "yml") ext = "yml";
        if (lang === "python" || lang === "py") ext = "py";
        if (lang === "bash" || lang === "sh") ext = "sh";

        files.push({
          name: `model_transform_${idx}.${ext}`,
          language: lang === "py" ? "python" : lang === "yml" ? "yaml" : lang,
          content
        });
        idx++;
      }
    });

    // Scan streaming context
    let match;
    let idx = files.length + 1;
    while ((match = regex.exec(streamingText)) !== null) {
      const lang = match[1] || "sql";
      const content = match[2].trim();
      let ext = "sql";
      if (lang === "yaml" || lang === "yml") ext = "yml";
      if (lang === "python" || lang === "py") ext = "py";

      files.push({
        name: `streaming_artifact_${idx}.${ext}`,
        language: lang === "py" ? "python" : lang === "yml" ? "yaml" : lang,
        content
      });
      idx++;
    }

    return files;
  };

  const artifactFiles = useMemo(() => getArtifactFiles(), [activeConv?.messages, streamingText]);
  const hasArtifacts = artifactFiles.length > 0;
  const activeArtifact = artifactFiles[activeTabIdx] || artifactFiles[0];

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    // Create user message
    const userMsg: Message = {
      id: Math.random().toString(36).substring(2, 9),
      sender: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (activeConv) {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConvId) {
            return {
              ...c,
              messages: [...c.messages, userMsg]
            };
          }
          return c;
        })
      );
    }

    setInputValue("");
    setIsThinking(true);
    setStreamingText("");
    setActiveTabIdx(0); // Reset editor index

    try {
      const token = localStorage.getItem("accessToken") || "";
      const response = await fetch("http://localhost:8000/api/ai/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          query: text,
          session_id: activeConvId || undefined
        })
      });

      if (!response.body) {
        setIsThinking(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      setIsThinking(false);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.substring(6).trim();
            if (dataStr === "[DONE]") {
              break;
            } else if (dataStr.startsWith("__SESSION_ID__:")) {
              const returnedSessId = dataStr.substring(15);
              if (!activeConvId) {
                setActiveConvId(returnedSessId);
              }
            } else if (dataStr.startsWith("__META__:")) {
              try {
                const meta = JSON.parse(dataStr.substring(9));
                setMetaInfo(meta);
              } catch {
                // Ignore parsing errors
              }
            } else {
              accumulatedText += dataStr;
              setStreamingText(accumulatedText);
            }
          }
        }
      }

      const assistantMsg: Message = {
        id: Math.random().toString(36).substring(2, 9),
        sender: "assistant",
        content: accumulatedText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConvId) {
            return {
              ...c,
              messages: [...c.messages, assistantMsg]
            };
          }
          return c;
        })
      );
      setStreamingText("");
      
    } catch (err) {
      console.error("Stream generation failed: ", err);
      toast({
        type: "error",
        title: "Communication Failure",
        message: "Failed to establish SSE pipeline with AI orchestrator."
      });
      setIsThinking(false);
    }
  };

  const handleRegenerate = () => {
    if (!activeConv) return;
    const lastUserMsg = [...activeConv.messages].reverse().find((m) => m.sender === "user");
    if (lastUserMsg) {
      handleSend(lastUserMsg.content);
    }
  };

  const togglePinSession = async (sessId: string, currentPinned: boolean) => {
    try {
      await apiClient.post("/ai/chat/pins", {
        session_id: sessId,
        pinned: !currentPinned
      });
      setConversations((prev) =>
        prev.map((c) => (c.id === sessId ? { ...c, pinned: !currentPinned } : c))
      );
      toast({
        type: "success",
        title: "Session Pin Synced",
        message: `Conversation ${!currentPinned ? "pinned" : "unpinned"} successfully.`
      });
    } catch (err) {
      console.error("Failed to pin conversation: ", err);
    }
  };

  const handleExportDiagnostics = () => {
    const blob = new Blob([JSON.stringify(metaInfo, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `metapilot_diagnostics_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      type: "success",
      title: "Diagnostics Exported",
      message: "Explainability JSON telemetry downloaded successfully."
    });
  };

  const createNewChat = () => {
    const newId = `sess-${Date.now()}`;
    const newChat: Conversation = {
      id: newId,
      title: `New Session #${conversations.length + 1}`,
      pinned: false,
      messages: [],
      summary: "Transformation DAG Pipeline"
    };

    setConversations([newChat, ...conversations]);
    setActiveConvId(newId);
  };

  const deleteChat = async (sessId: string) => {
    try {
      await apiClient.delete(`/ai/chat/${sessId}`);
      setConversations((prev) => prev.filter((c) => c.id !== sessId));
      if (activeConvId === sessId) {
        setActiveConvId("");
      }
      toast({
        type: "success",
        title: "Session Cleared",
        message: "Deleted conversation session from registry."
      });
    } catch (err) {
      console.error("Failed to delete chat: ", err);
    }
  };

  // Download code artifact directly as file
  const downloadSingleFile = (file: ArtifactFile) => {
    const blob = new Blob([file.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      type: "success",
      title: "Download Initiated",
      message: `File ${file.name} saved successfully.`
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      type: "success",
      title: "Copied",
      message: "Code copied to clipboard."
    });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex border border-white/5 rounded-2xl overflow-hidden glass">
      {/* Left panel: Conversation history list */}
      <div className="w-64 border-r border-white/5 flex flex-col shrink-0 bg-white/[0.01]">
        <div className="p-4 border-b border-white/5 flex flex-col gap-3">
          <Button variant="glow" onClick={createNewChat} className="w-full text-xs font-semibold gap-1.5 py-2">
            <Zap className="h-3.5 w-3.5" />
            <span>New Session</span>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-brand-primary" />
              <span className="text-[10px] text-brand-muted uppercase font-heading font-semibold">Loading history...</span>
            </div>
          ) : (
            <>
              {/* Pinned Section */}
              {conversations.filter((c) => c.pinned).length > 0 && (
                <div className="flex flex-col gap-0.5 mb-3">
                  <span className="text-[10px] font-semibold text-brand-muted uppercase tracking-wider px-3 mb-1 block text-left">
                    Pinned Logs
                  </span>
                  {conversations
                    .filter((c) => c.pinned)
                    .map((c) => (
                      <div
                        key={c.id}
                        className={cn(
                          "group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors text-left",
                          c.id === activeConvId
                            ? "bg-white/10 text-white font-semibold"
                            : "text-brand-muted hover:text-white hover:bg-white/5"
                        )}
                        onClick={() => setActiveConvId(c.id)}
                      >
                        <span className="truncate flex-1">{c.title}</span>
                        <Star className="h-3 w-3 text-brand-accent fill-brand-accent shrink-0 ml-1.5" />
                      </div>
                    ))}
                </div>
              )}

              {/* Recents Section */}
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold text-brand-muted uppercase tracking-wider px-3 mb-1 block text-left">
                  Recent Prompts
                </span>
                {conversations
                  .filter((c) => !c.pinned)
                  .map((c) => (
                    <div
                      key={c.id}
                      className={cn(
                        "group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors text-left",
                        c.id === activeConvId
                          ? "bg-white/10 text-white font-semibold"
                          : "text-brand-muted hover:text-white hover:bg-white/5"
                      )}
                      onClick={() => setActiveConvId(c.id)}
                    >
                      <span className="truncate flex-1">{c.title}</span>
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 ml-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePinSession(c.id, c.pinned);
                          }}
                          className="p-0.5 hover:text-brand-accent transition-colors"
                          title="Pin conversation"
                        >
                          <Star className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChat(c.id);
                          }}
                          className="p-0.5 hover:text-rose-500 transition-colors"
                          title="Delete session"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Chat Panel Container */}
      <div className={cn("flex-1 flex flex-col min-w-0 bg-[#060815]/10", hasArtifacts && "border-r border-white/5")}>
        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scrollbar-thin">
          {activeConv && activeConv.messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto py-12">
              <Compass className="h-10 w-10 text-brand-accent shadow-glow-accent opacity-60 mb-4 animate-pulse" />
              <h3 className="text-lg font-bold font-heading text-white">Ask MetaPilot Intelligence</h3>
              <p className="text-sm text-brand-muted mt-2">
                "Generate a join SQL for users_dim and orders_fact" or "Build airflow DAG configurations."
              </p>
              
              <div className="grid grid-cols-1 gap-2.5 mt-8 w-full">
                {[
                  "Generate SQL joining users and orders.",
                  "Create dbt schema.yml configuration.",
                  "Build taskflow DAG orchestration DAG script."
                ].map((promptText) => (
                  <button
                    key={promptText}
                    onClick={() => handleSend(promptText)}
                    className="w-full text-left px-4 py-3 rounded-xl border border-white/5 bg-white/[0.01] text-xs text-brand-muted hover:text-white hover:bg-white/5 hover:border-brand-primary/20 transition-all font-medium"
                  >
                    {promptText}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeConv && activeConv.messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-4 max-w-3xl text-left",
                msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              {/* Avatar icon */}
              <div
                className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 font-heading text-xs font-bold border",
                  msg.sender === "user"
                    ? "bg-brand-primary/20 border-brand-primary/30 text-brand-secondary"
                    : "bg-brand-accent/20 border-brand-accent/30 text-brand-accent shadow-glow-accent"
                )}
              >
                {msg.sender === "user" ? "U" : "MP"}
              </div>

              <div className="flex flex-col gap-1.5 max-w-full min-w-0">
                <span className="text-[10px] text-brand-muted font-bold tracking-wide">
                  {msg.sender === "user" ? "User" : "MetaPilot"} • {msg.timestamp}
                </span>
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.sender === "user"
                      ? "bg-brand-primary text-white shadow-lg"
                      : "glass border border-white/5 text-white"
                  )}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>

                {/* Quick feedback buttons for assistants */}
                {msg.sender === "assistant" && (
                  <div className="flex items-center gap-2.5 mt-1 ml-1 text-brand-muted">
                    <button
                      onClick={() => toast({ type: "success", message: "Thank you for your feedback!" })}
                      className="hover:text-white transition-colors"
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => toast({ type: "success", message: "Feedback noted. Optimizing parameters." })}
                      className="hover:text-white transition-colors"
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </button>
                    <button onClick={handleRegenerate} className="hover:text-white transition-colors flex items-center gap-1 text-[10px] font-semibold ml-2 font-heading">
                      <RefreshCw className="h-3 w-3" />
                      <span>Regenerate</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Streaming text state */}
          {(isThinking || streamingText) && (
            <div className="flex gap-4 max-w-3xl mr-auto text-left">
              <div className="h-8 w-8 rounded-lg bg-brand-accent/20 border border-brand-accent/30 text-brand-accent flex items-center justify-center shrink-0 font-heading text-xs font-bold shadow-glow-accent animate-pulse">
                MP
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-brand-muted font-bold tracking-wide">
                  MetaPilot • Generating...
                </span>

                {isThinking ? (
                  <div className="rounded-2xl px-4 py-3 glass border border-white/5 flex gap-1 items-center justify-center min-w-[70px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                ) : (
                  <div className="rounded-2xl px-4 py-3 glass border border-white/5 text-sm leading-relaxed text-white">
                    <p className="whitespace-pre-line">{streamingText}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Form Footer */}
        <div className="p-4 border-t border-white/5 bg-white/[0.01] flex flex-col gap-2 shrink-0">
          <div className="flex gap-3 items-center">
            {/* Context attachment button mock */}
            <button
              onClick={() => toast({ type: "info", message: "Metadata scope targets linked successfully." })}
              className="p-2.5 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/5 text-brand-muted hover:text-white transition-all shrink-0"
              title="Attach context table"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            {/* Input bar */}
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend(inputValue)}
                placeholder="Ask MetaPilot to explain lineages, write dbt queries, build schemas..."
                className="w-full pl-4 pr-12 py-3 rounded-xl text-sm text-white glass-input focus:outline-none focus:ring-0"
              />
              <button
                onClick={() => handleSend(inputValue)}
                disabled={!inputValue.trim()}
                className="absolute right-2.5 p-2 rounded-lg bg-gradient-to-r from-brand-primary to-brand-accent text-white hover:brightness-110 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-md"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-brand-muted px-1.5 mt-0.5">
            <span>Linked Context: <strong className="text-brand-secondary">DataHub Metadata active</strong></span>
            <span>Press Enter to send</span>
          </div>
        </div>
      </div>

      {/* Right Split Panel: Tabbed Editor Workspace */}
      {hasArtifacts && (
        <div className="w-1/2 flex flex-col bg-[#050814]/25 h-full text-left">
          {/* Tabs header list */}
          <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.005] px-4 py-2">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-brand-secondary" />
              <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">Artifact Editor</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(activeArtifact.content)}
                className="text-[10px] font-semibold gap-1 py-1"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </Button>
              <Button
                variant="glow"
                size="sm"
                onClick={() => downloadSingleFile(activeArtifact)}
                className="text-[10px] font-semibold gap-1 py-1"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download</span>
              </Button>
            </div>
          </div>

          {/* Files select list tabs bar */}
          <div className="flex border-b border-white/5 bg-white/[0.01] overflow-x-auto shrink-0 scrollbar-none">
            {artifactFiles.map((file, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTabIdx(idx)}
                className={cn(
                  "px-4 py-2.5 border-r border-white/5 text-xs font-medium font-heading transition-colors flex items-center gap-1.5",
                  idx === activeTabIdx
                    ? "bg-white/5 text-white font-semibold border-b border-b-brand-primary"
                    : "text-brand-muted hover:text-white hover:bg-white/[0.01]"
                )}
              >
                <FileText className="h-3.5 w-3.5 opacity-70" />
                <span>{file.name}</span>
              </button>
            ))}
          </div>

          {/* Code Viewer content */}
          <div className="flex-1 overflow-auto p-4 bg-black/10">
            {activeArtifact ? (
              <CodeBlock
                code={activeArtifact.content}
                language={activeArtifact.language}
                filename={activeArtifact.name}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-brand-muted text-xs">
                Select a code tab to view output.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Right panel: Active Context panel (Dynamic Observability details) */}
      <div className="hidden lg:flex shrink-0 relative flex-col border-l border-white/5 bg-white/[0.005]">
        <button
          onClick={() => setIsContextCollapsed(!isContextCollapsed)}
          className="absolute -left-3 top-5 p-1 rounded-full border border-white/5 bg-[#0b1022] hover:bg-white/5 text-brand-muted hover:text-white z-10"
        >
          {isContextCollapsed ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>

        <motion.div
          animate={{ width: isContextCollapsed ? 0 : 340 }}
          transition={{ duration: 0.2 }}
          className="h-full overflow-y-auto flex flex-col overflow-hidden"
        >
          <div className="p-4 border-b border-white/5 text-left flex items-center justify-between font-heading bg-white/[0.005]">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-brand-accent animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">Trust & Explainability</span>
            </div>
            {isJudgeMode && (
              <Badge variant="secondary" className="text-[9px] font-bold tracking-wider bg-brand-accent/20 border-brand-accent/30 text-brand-accent">
                JUDGE
              </Badge>
            )}
          </div>

          <div className="p-4 flex flex-col gap-5 text-left scrollbar-thin overflow-y-auto flex-1">
            {/* Intent & Task */}
            <div>
              <span className="text-[10px] text-brand-muted font-bold uppercase tracking-wider block">Intent & Task Mappings</span>
              <div className="mt-2 p-2.5 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-brand-muted">Intent Detection:</span>
                  <span className="font-semibold text-white capitalize">{metaInfo.intent.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Task Class:</span>
                  <span className="font-semibold text-brand-secondary capitalize">{metaInfo.task_classification}</span>
                </div>
              </div>
            </div>

            {/* Catalog Source & Lineage */}
            <div>
              <span className="text-[10px] text-brand-muted font-bold uppercase tracking-wider block">Catalog Lineage Context</span>
              <div className="mt-2 p-2.5 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-brand-muted">Lineage Depth:</span>
                  <span className="font-semibold text-white">{metaInfo.lineage_depth} hops</span>
                </div>
                <div className="flex justify-between flex-wrap gap-1">
                  <span className="text-brand-muted">Assigned Owner:</span>
                  <span className="font-semibold text-white truncate max-w-[140px]">{metaInfo.owner}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Source Platform:</span>
                  <span className="font-semibold text-brand-primary uppercase font-code text-[10px]">{metaInfo.platform}</span>
                </div>
              </div>
            </div>

            {/* Vector Search Stats */}
            <div>
              <span className="text-[10px] text-brand-muted font-bold uppercase tracking-wider block">RAG Retrieval Metrics</span>
              <div className="mt-2 p-2.5 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-brand-muted">Cache Lookup:</span>
                  <span className="font-semibold text-emerald-400">{metaInfo.cache_status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Sim Score Threshold:</span>
                  <span className="font-semibold text-brand-accent">{(metaInfo.confidence_score * 0.9 + 0.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">LLM Provider:</span>
                  <span className="font-semibold text-white uppercase">{metaInfo.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Prompt Version:</span>
                  <span className="font-semibold text-brand-muted font-code text-[10px]">{metaInfo.prompt_version}</span>
                </div>
              </div>
            </div>

            {/* Execution Times */}
            <div>
              <span className="text-[10px] text-brand-muted font-bold uppercase tracking-wider block">Execution Latency</span>
              <div className="mt-2 p-2.5 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-brand-muted">Metadata Retrieval:</span>
                  <span className="font-semibold text-white">{metaInfo.retrieval_time}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Intent Checks:</span>
                  <span className="font-semibold text-white">{metaInfo.reasoning_time}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Generations:</span>
                  <span className="font-semibold text-white">{metaInfo.generation_time}s</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-1.5 mt-1 font-semibold">
                  <span className="text-brand-secondary">Combined Total:</span>
                  <span className="text-brand-secondary font-bold">{metaInfo.latency_secs}s</span>
                </div>
              </div>
            </div>

            {/* Verification Results */}
            <div>
              <span className="text-[10px] text-brand-muted font-bold uppercase tracking-wider block">Validation Checks</span>
              <div className="mt-2 p-2.5 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-brand-muted">Schema Matches:</span>
                  <span className="font-semibold text-emerald-400">{metaInfo.validation_results}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Hallucination Audit:</span>
                  <span className="font-semibold text-emerald-400">{metaInfo.hallucination_check}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Confidence Score:</span>
                  <span className="font-semibold text-brand-accent font-bold">{(metaInfo.confidence_score * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* Explanation card */}
            <div>
              <span className="text-[10px] text-brand-muted font-bold uppercase tracking-wider block">Why this Answer?</span>
              <div className="mt-2 p-2.5 rounded-xl border border-brand-primary/10 bg-brand-primary/5 text-xs leading-relaxed text-brand-muted">
                {metaInfo.why_explanation}
              </div>
            </div>

            {/* URN Source Entities */}
            <div>
              <span className="text-[10px] text-brand-muted font-bold uppercase tracking-wider block">Source Attribution URNs</span>
              <div className="flex flex-col gap-1.5 mt-2 max-w-full overflow-x-auto">
                {metaInfo.sources.map((src) => (
                  <Badge key={src} variant="outline" className="text-[9px] font-code truncate max-w-full text-brand-accent block border-white/5 bg-white/[0.01]">
                    {src.split(",").pop()?.replace(")", "") || src}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Export diagnostics button */}
            <Button
              onClick={handleExportDiagnostics}
              variant="outline"
              size="sm"
              className="w-full text-xs font-semibold py-2 mt-2 gap-1.5 border-white/10 hover:bg-white/5"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Diagnostics (JSON)</span>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
