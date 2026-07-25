import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { authApi } from "../api/auth";
import { userApi } from "../api/user";
import { useToast } from "../hooks/useToast";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface WorkspaceSettings {
  theme: string;
  sidebarCollapsed: boolean;
  notifications: {
    onSuccess: boolean;
    onWarn: boolean;
    onDegraded: boolean;
  };
  shortcuts?: Record<string, string>;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

interface AuthContextType {
  user: UserProfile | null;
  settings: WorkspaceSettings;
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  registerUser: (details: any) => Promise<void>;
  logout: () => Promise<void>;
  updateSettings: (newSettings: Partial<WorkspaceSettings>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  syncProfile: () => Promise<void>;
}

const defaultSettings: WorkspaceSettings = {
  theme: "dark",
  sidebarCollapsed: false,
  notifications: {
    onSuccess: true,
    onWarn: true,
    onDegraded: false,
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<WorkspaceSettings>(defaultSettings);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const syncProfile = async () => {
    try {
      const profile = await userApi.getProfile();
      setUser(profile);
      
      const workspace = await userApi.getWorkspace();
      if (workspace && workspace.settings) {
        setSettings({ ...defaultSettings, ...workspace.settings });
      }

      const notifs = await userApi.getNotifications();
      setNotifications(notifs);
    } catch (err) {
      console.warn("Failed to synchronize user profile session logs: ", err);
      // Clean stale local storage tokens on parse crash
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        await syncProfile();
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: any) => {
    setLoading(true);
    try {
      const response = await authApi.login(credentials);
      localStorage.setItem("accessToken", response.access_token);
      localStorage.setItem("refreshToken", response.refresh_token);
      
      await syncProfile();
      
      toast({
        type: "success",
        title: "Login Successful",
        message: "Welcome to MetaPilot catalog dashboard.",
      });
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || "Failed to log in. Check credentials.";
      toast({
        type: "error",
        title: "Authentication Failed",
        message: msg,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (details: any) => {
    setLoading(true);
    try {
      const response = await authApi.register(details);
      localStorage.setItem("accessToken", response.access_token);
      localStorage.setItem("refreshToken", response.refresh_token);
      
      await syncProfile();

      toast({
        type: "success",
        title: "Registration Successful",
        message: "Your MetaPilot developer space is ready.",
      });
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || "Registration failed. Try again.";
      toast({
        type: "error",
        title: "Registration Failed",
        message: msg,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch (err) {
        console.warn("Error invalidating remote session: ", err);
      }
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setSettings(defaultSettings);
    setNotifications([]);
    
    toast({
      type: "info",
      title: "Logged Out",
      message: "Successfully signed out from your workspace.",
    });
  };

  const updateSettings = async (newSettings: Partial<WorkspaceSettings>) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    
    // Dynamically apply visual theme classes on document root
    if (newSettings.theme) {
      const root = window.document.documentElement;
      if (newSettings.theme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }

    try {
      await userApi.updateWorkspace(merged);
    } catch (err) {
      console.warn("Failed to persist workspace settings: ", err);
    }
  };

  const markNotificationRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await userApi.markNotificationRead(id, true);
    } catch (err) {
      console.warn("Failed to update notification read state: ", err);
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      const unreads = notifications.filter((n) => !n.is_read);
      await Promise.all(
        unreads.map((n) => userApi.markNotificationRead(n.id, true))
      );
    } catch (err) {
      console.warn("Failed to update all notifications: ", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        settings,
        notifications,
        unreadCount,
        loading,
        login,
        registerUser,
        logout,
        updateSettings,
        markNotificationRead,
        markAllNotificationsRead,
        syncProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be executed within an AuthProvider root wrapper.");
  }
  return context;
}
