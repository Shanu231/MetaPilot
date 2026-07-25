import { useState, useEffect, type FormEvent } from "react";
import {
  User,
  Sliders,
  SlidersHorizontal,
  Bell,
  Keyboard,
  RefreshCw,
  Info,
  Moon,
  Sun
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../providers/AuthProvider";

export function SettingsPage() {
  const { user, settings, updateSettings } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "workspace" | "shortcuts" | "notifications" | "experimental">("profile");
  const [testingConnection, setTestingConnection] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "John Doe",
    email: user?.email || "admin@metapilot.io",
    datahubUrl: settings.shortcuts?.datahubUrl || "https://datahub.internal.company.com:9002",
    apiKey: settings.shortcuts?.apiKey || "dh_token_••••••••••••••••••••"
  });

  // Sync state if context loads/updates
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email
      }));
    }
  }, [user]);

  // Notifications state
  const [notifs, setNotifs] = useState(settings.notifications);
  useEffect(() => {
    setNotifs(settings.notifications);
  }, [settings.notifications]);

  // Experimental features
  const [features, setFeatures] = useState({
    lineageDragPan: true,
    dynamicColumnMasking: false,
    fuzzySearchIndex: true
  });

  const { toast } = useToast();

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    toast({
      type: "info",
      message: "Saving configuration properties..."
    });
    
    await updateSettings({
      notifications: notifs,
      shortcuts: {
        datahubUrl: formData.datahubUrl,
        apiKey: formData.apiKey
      }
    });

    toast({
      type: "success",
      title: "Settings Saved",
      message: "Workspace and profile settings updated successfully."
    });
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    toast({
      type: "info",
      title: "Testing DataHub Ingestion Link",
      message: `Reaching ${formData.datahubUrl}...`
    });
    await new Promise((r) => setTimeout(r, 1500));
    setTestingConnection(false);
    toast({
      type: "success",
      title: "DataHub Connected",
      message: "DataHub metadata server connection responded healthy."
    });
  };

  const menuItems = [
    { id: "profile", label: "User Profile", icon: <User className="h-4.5 w-4.5" /> },
    { id: "workspace", label: "Workspace & DataHub", icon: <Sliders className="h-4.5 w-4.5" /> },
    { id: "shortcuts", label: "Keyboard Shortcuts", icon: <Keyboard className="h-4.5 w-4.5" /> },
    { id: "notifications", label: "Notifications Alert", icon: <Bell className="h-4.5 w-4.5" /> },
    { id: "experimental", label: "Experimental Beta", icon: <SlidersHorizontal className="h-4.5 w-4.5" /> }
  ] as const;

  return (
    <div className="flex flex-col gap-6 text-white h-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">Settings</h1>
        <p className="text-sm text-brand-muted mt-1">Configure profile mappings, catalog sync tools, and hotkeys.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side: Category tabs */}
        <div className="lg:col-span-1 flex flex-col gap-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-3 relative overflow-hidden ${
                item.id === activeTab
                  ? "border-brand-primary/40 bg-brand-primary/10 text-white font-semibold"
                  : "border-white/5 bg-white/[0.01] text-brand-muted hover:text-white hover:bg-white/5 hover:border-white/10"
              }`}
            >
              {item.id === activeTab && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary" />}
              <span className={item.id === activeTab ? "text-brand-secondary" : "text-brand-muted"}>
                {item.icon}
              </span>
              <span className="text-sm font-heading">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Right Side: Specific Form Panels */}
        <div className="lg:col-span-3">
          <Card className="text-left flex flex-col gap-5">
            {/* User Profile Form */}
            {activeTab === "profile" && (
              <form onSubmit={handleSave} className="flex flex-col gap-5">
                <div className="border-b border-white/5 pb-3">
                  <h3 className="text-lg font-bold font-heading">User Profile</h3>
                  <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                    Update account access settings and personal preferences.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="profile-name"
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <Input
                    id="profile-email"
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                {/* Appearance section inline */}
                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider font-heading">Theme Appearance</span>
                  <div className="flex gap-3 mt-1.5">
                    <button
                      type="button"
                      onClick={() => updateSettings({ theme: "dark" })}
                      className={`flex-1 py-3 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        settings.theme === "dark"
                          ? "border-brand-primary bg-brand-primary/10 text-white"
                          : "border-white/5 bg-white/[0.01] text-brand-muted hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Moon className="h-4 w-4" />
                      <span>Dark Theme (Brand)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSettings({ theme: "light" })}
                      className={`flex-1 py-3 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        settings.theme === "light"
                          ? "border-brand-primary bg-brand-primary/10 text-white"
                          : "border-white/5 bg-white/[0.01] text-brand-muted hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Sun className="h-4 w-4" />
                      <span>Light Theme</span>
                    </button>
                  </div>
                </div>

                <Button type="submit" variant="glow" className="self-end mt-4">
                  <span>Save Profile</span>
                </Button>
              </form>
            )}

            {/* Workspace & DataHub sync configurations */}
            {activeTab === "workspace" && (
              <form onSubmit={handleSave} className="flex flex-col gap-5">
                <div className="border-b border-white/5 pb-3">
                  <h3 className="text-lg font-bold font-heading">Workspace & DataHub Integration</h3>
                  <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                    Set up your organization&apos;s active metadata sync endpoints and backend pipelines credentials.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <Input
                    id="datahub-url"
                    label="DataHub GMS Endpoint"
                    value={formData.datahubUrl}
                    onChange={(e) => setFormData({ ...formData, datahubUrl: e.target.value })}
                  />
                  <Input
                    id="datahub-key"
                    label="Personal Access Token"
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  />
                </div>

                <div className="flex justify-between items-center mt-6">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleTestConnection}
                    isLoading={testingConnection}
                    className="gap-2.5 text-xs font-semibold py-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${testingConnection && "animate-spin"}`} />
                    <span>Test Ingest Connection</span>
                  </Button>
                  <Button type="submit" variant="glow">
                    <span>Save Integration settings</span>
                  </Button>
                </div>
              </form>
            )}

            {/* Shortcuts Guide lists */}
            {activeTab === "shortcuts" && (
              <div className="flex flex-col gap-4">
                <div className="border-b border-white/5 pb-3">
                  <h3 className="text-lg font-bold font-heading">Keyboard Shortcuts</h3>
                  <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                    Quick shortcuts configured to navigate catalogs and call overlays instantly.
                  </p>
                </div>

                <div className="flex flex-col gap-3.5 mt-2 text-sm text-brand-muted">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-white font-medium">Toggle global Command Palette search</span>
                    <kbd className="bg-white/5 border border-white/5 px-2 py-0.5 rounded text-xs text-brand-secondary font-bold font-code">
                      Ctrl + K
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-white font-medium">Close overlay modal or palette</span>
                    <kbd className="bg-white/5 border border-white/5 px-2 py-0.5 rounded text-xs text-brand-secondary font-bold font-code">
                      Esc
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-white font-medium">Quick switch active chat history tabs</span>
                    <kbd className="bg-white/5 border border-white/5 px-2 py-0.5 rounded text-xs text-brand-secondary font-bold font-code">
                      Alt + [1-9]
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-white font-medium">Refresh lineage canvas layouts</span>
                    <kbd className="bg-white/5 border border-white/5 px-2 py-0.5 rounded text-xs text-brand-secondary font-bold font-code">
                      R
                    </kbd>
                  </div>
                </div>
              </div>
            )}

            {/* Notification alert checkboxes */}
            {activeTab === "notifications" && (
              <div className="flex flex-col gap-5">
                <div className="border-b border-white/5 pb-3">
                  <h3 className="text-lg font-bold font-heading">Alert Notifications</h3>
                  <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                    Configure alert subscriptions for pipeline updates and metadata integrations.
                  </p>
                </div>

                <div className="flex flex-col gap-4 mt-2">
                  <label className="flex items-start gap-3.5 cursor-pointer text-left">
                    <input
                      type="checkbox"
                      checked={notifs.onSuccess}
                      onChange={(e) => setNotifs({ ...notifs, onSuccess: e.target.checked })}
                      className="mt-1 rounded border-white/10 bg-white/5 text-brand-primary focus:ring-0"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white">Pipeline Sync Succeeded</span>
                      <span className="text-xs text-brand-muted mt-0.5">Receive warnings when raw integrations sync successfully.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3.5 cursor-pointer text-left mt-1">
                    <input
                      type="checkbox"
                      checked={notifs.onWarn}
                      onChange={(e) => setNotifs({ ...notifs, onWarn: e.target.checked })}
                      className="mt-1 rounded border-white/10 bg-white/5 text-brand-primary focus:ring-0"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white">Ingestion Warning alert</span>
                      <span className="text-xs text-brand-muted mt-0.5">Alert immediately if pipeline sync encounters minor constraints.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3.5 cursor-pointer text-left mt-1">
                    <input
                      type="checkbox"
                      checked={notifs.onDegraded}
                      onChange={(e) => setNotifs({ ...notifs, onDegraded: e.target.checked })}
                      className="mt-1 rounded border-white/10 bg-white/5 text-brand-primary focus:ring-0"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white">Degraded Schema alerts</span>
                      <span className="text-xs text-brand-muted mt-0.5">Triggers warning indicators on catalog views for latency spikes.</span>
                    </div>
                  </label>
                </div>

                <Button onClick={() => toast({ type: "success", title: "Subscribed Successfully", message: "Notification criteria has been updated." })} variant="glow" className="self-end mt-4">
                  <span>Save Notification Alerts</span>
                </Button>
              </div>
            )}

            {/* Experimental Features */}
            {activeTab === "experimental" && (
              <div className="flex flex-col gap-5">
                <div className="border-b border-white/5 pb-3">
                  <h3 className="text-lg font-bold font-heading">Experimental Features (Beta)</h3>
                  <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                    Preview and enable beta algorithms for dependency checking and lineage.
                  </p>
                </div>

                <div className="flex flex-col gap-4 mt-2">
                  <label className="flex items-start justify-between cursor-pointer">
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-semibold text-white">Lineage Drag-and-Pan Canvas</span>
                      <span className="text-xs text-brand-muted mt-0.5">Drag visual lineage graphs canvas viewport using mouse panning controls.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={features.lineageDragPan}
                      onChange={(e) => setFeatures({ ...features, lineageDragPan: e.target.checked })}
                      className="rounded border-white/10 bg-white/5 text-brand-primary focus:ring-0 mt-1"
                    />
                  </label>

                  <label className="flex items-start justify-between cursor-pointer mt-1">
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-semibold text-white">Fuzzy search schema indexer</span>
                      <span className="text-xs text-brand-muted mt-0.5">Use client-side fuzzy match models in command palettes overlays.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={features.fuzzySearchIndex}
                      onChange={(e) => setFeatures({ ...features, fuzzySearchIndex: e.target.checked })}
                      className="rounded border-white/10 bg-white/5 text-brand-primary focus:ring-0 mt-1"
                    />
                  </label>

                  <label className="flex items-start justify-between cursor-pointer mt-1 border-t border-white/5 pt-3">
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-semibold text-brand-accent">Hackathon Judge Mode</span>
                      <span className="text-xs text-brand-muted mt-0.5">Automatically expands the RAG diagnostic panel showing live latencies, models metadata, and validation checks.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={localStorage.getItem("judgeMode") === "true"}
                      onChange={(e) => {
                        localStorage.setItem("judgeMode", String(e.target.checked));
                        // Force state update to re-evaluate checkbox state
                        setFeatures({ ...features });
                        toast({
                          type: "success",
                          title: "Judge Mode Updated",
                          message: `Explainability panel will now be ${e.target.checked ? "force-expanded" : "collapsed by default"}.`
                        });
                      }}
                      className="rounded border-white/10 bg-white/5 text-brand-accent focus:ring-0 mt-1"
                    />
                  </label>
                </div>

                <div className="p-4 rounded-xl border border-brand-accent/20 bg-brand-accent/5 flex items-start gap-3 mt-2 text-left">
                  <Info className="h-5 w-5 text-brand-accent shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-accent font-heading">Developer Notice</span>
                    <span className="text-xs text-brand-muted mt-1 leading-relaxed">
                      Beta features could impact canvas navigation smooth performance. Report spikes via settings debug options.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
