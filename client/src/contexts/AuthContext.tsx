import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, ApiError } from "../lib/api";
import type { Student } from "../types";

interface AuthContextValue {
  user: Student | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function saveSession(token: string): void {
  localStorage.setItem("campusconnect.token", token);
}

function clearSession(): void {
  localStorage.removeItem("campusconnect.token");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const result = await api<{ user: Student }>("/auth/me");
    setUser(result.user);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("campusconnect.token")) {
      setLoading(false);
      return;
    }
    refreshUser()
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) {
          clearSession();
          setUser(null);
          return;
        }
        console.error("Could not restore the saved session.", error);
      })
      .finally(() => setLoading(false));
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api<{ token: string; user: Student }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    saveSession(result.token);
    setUser(result.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const result = await api<{ token: string; user: Student }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    saveSession(result.token);
    setUser(result.user);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser }),
    [user, loading, login, register, logout, refreshUser],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
