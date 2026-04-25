import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  weight?: number;
  height?: number;
  age?: number;
  gender?: string;
  goal?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage on mount
    const savedUser = localStorage.getItem("gizimeal_user");
    const savedToken = localStorage.getItem("gizimeal_token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login gagal");

    const profile: UserProfile = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || email.split("@")[0],
    };
    setUser(profile);
    setToken(data.token);
    localStorage.setItem("gizimeal_user", JSON.stringify(profile));
    localStorage.setItem("gizimeal_token", data.token);
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registrasi gagal");

    const profile: UserProfile = {
      id: data.user?.id || Date.now().toString(),
      email,
      name,
    };
    setUser(profile);
    if (data.session?.access_token) {
      setToken(data.session.access_token);
      localStorage.setItem("gizimeal_token", data.session.access_token);
    }
    localStorage.setItem("gizimeal_user", JSON.stringify(profile));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("gizimeal_user");
    localStorage.removeItem("gizimeal_token");
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem("gizimeal_user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
