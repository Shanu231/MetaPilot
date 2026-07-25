import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  MessageSquare,
  Database,
  GitBranch,
  FileCode,
  LineChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  User,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react";
import { useTheme } from "../providers/ThemeProvider";
import { CommandPalette } from "../components/shared/CommandPalette";
import { Dropdown } from "../components/ui/Dropdown";
import logoImg from "../assets/logo.jpg";
import { cn } from "../utils/cn";

import { useAuth } from "../providers/AuthProvider";

export function DashboardLayout() {
  const {
    user,
    logout,
    settings,
    updateSettings,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead
  } = useAuth();

  const isSidebarCollapsed = settings.sidebarCollapsed;
  const setIsSidebarCollapsed = (val: boolean) => updateSettings({ sidebarCollapsed: val });
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Listen to Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: "AI Workspace", path: "/dashboard/workspace", icon: <MessageSquare className="h-5 w-5" /> },
    { name: "Metadata Explorer", path: "/dashboard/metadata", icon: <Database className="h-5 w-5" /> },
    { name: "Lineage Graph", path: "/dashboard/lineage", icon: <GitBranch className="h-5 w-5" /> },
    { name: "Generated Files", path: "/dashboard/files", icon: <FileCode className="h-5 w-5" /> },
    { name: "Analytics", path: "/dashboard/analytics", icon: <LineChart className="h-5 w-5" /> },
    { name: "Settings", path: "/dashboard/settings", icon: <Settings className="h-5 w-5" /> }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout failed: ", err);
    }
  };

  const profileItems = [
    { id: "p-profile", label: "My Profile", icon: <User className="h-4 w-4" />, onClick: () => navigate("/dashboard/settings") },
    { id: "p-settings", label: "Workspace Settings", icon: <Settings className="h-4 w-4" />, onClick: () => navigate("/dashboard/settings") },
    { id: "p-logout", label: "Sign Out", icon: <LogOut className="h-4 w-4" />, onClick: handleLogout, divider: true, danger: true }
  ];

  return (
    <div className="flex min-h-screen bg-brand-bg text-white relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Sidebar navigation */}
      <motion.aside
        animate={{ width: isSidebarCollapsed ? 80 : 260 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="glass-panel border-r border-white/5 flex flex-col relative z-25 shrink-0 hidden md:flex"
      >
        {/* Top Header Logo */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3.5 min-w-0">
            <img src={logoImg} alt="MetaPilot logo" className="h-8 w-8 rounded-lg shadow-glow-secondary object-cover" />
            <AnimatePresence>
              {!isSidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-heading text-lg font-bold tracking-tight text-white truncate"
                >
                  MetaPilot
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="text-brand-muted hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all group overflow-hidden font-heading text-sm font-medium",
                  isActive ? "text-white" : "text-brand-muted hover:text-white"
                )}
              >
                {/* Framer motion active indicator tag background */}
                {isActive && (
                  <motion.div
                    layoutId="active-nav-indicator"
                    className="absolute inset-0 bg-gradient-to-r from-brand-primary/20 to-brand-accent/10 border border-brand-primary/20 rounded-xl"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex-shrink-0">{item.icon}</div>
                {!isSidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative z-10 truncate"
                  >
                    {item.name}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Account panel at bottom */}
        <div className="p-4 border-t border-white/5">
          <Dropdown
            align="left"
            trigger={
              <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer w-full text-left">
                <div className="h-9 w-9 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-brand-secondary font-bold text-sm font-heading">
                  {user ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase() : "JD"}
                </div>
                {!isSidebarCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-white truncate">{user?.name || "John Doe"}</span>
                    <span className="text-[10px] text-brand-muted truncate">{user?.role || "Viewer"} Workspace</span>
                  </div>
                )}
              </div>
            }
            items={profileItems}
            className="w-full"
          />
        </div>
      </motion.aside>

      {/* Main workspace container */}
      <div className="flex-1 flex flex-col min-w-0 relative h-screen">
        {/* Navbar */}
        <header className="glass-navbar h-16 px-6 flex items-center justify-between z-20 shrink-0">
          {/* Breadcrumb / Left Side */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-heading font-medium text-brand-muted capitalize">
              {location.pathname.split("/").pop() || "Overview"}
            </span>
          </div>

          {/* Right Side Options */}
          <div className="flex items-center gap-4">
            {/* Command Palette Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="px-3.5 py-1.5 rounded-xl border border-white/5 hover:border-white/15 bg-white/[0.02] text-brand-muted flex items-center gap-2 hover:text-white transition-all text-xs"
            >
              <Search className="h-4 w-4" />
              <span>Search catalogs...</span>
              <kbd className="bg-white/5 border border-white/5 px-1.5 py-0.5 rounded text-[10px] text-brand-muted font-bold ml-1 tracking-wider">
                Ctrl+K
              </kbd>
            </button>

            {/* Notifications Trigger */}
            <Dropdown
              align="right"
              trigger={
                <button className="relative text-brand-muted hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-rose-500 rounded-full border-2 border-brand-bg shadow-glow-accent animate-pulse" />
                  )}
                </button>
              }
              items={[
                {
                  id: "n-title",
                  label: `Notifications (${unreadCount} unread)`,
                  onClick: markAllNotificationsRead,
                  icon: <Bell className="h-4 w-4 text-brand-primary" />
                },
                ...notifications.map((n) => ({
                  id: n.id,
                  label: n.title,
                  icon:
                    n.type === "success" ? (
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                    ) : n.type === "warn" ? (
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                    ) : (
                      <Info className="h-4 w-4 text-cyan-400" />
                    ),
                  onClick: () => {
                    markNotificationRead(n.id);
                    navigate("/dashboard");
                  }
                }))
              ]}
            />

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-brand-muted hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </header>

        {/* Content Outlet scroll layout */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#050816]/30">
          <Outlet />
        </main>
      </div>

      {/* Global Command palette dialog */}
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
