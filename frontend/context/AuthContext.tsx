"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { message } from "antd";

type User = {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

async function fetchAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return null;
    const { accessToken } = await res.json();
    console.log("Access token:", accessToken);

    return accessToken;
  } catch {
    return null;
  }
}

async function fetchCurrentUser(accessToken: string): Promise<User> {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch user");
  const { user } = await res.json();
  return user;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const initialize = async () => {
    const token = await fetchAccessToken();
    if (token) {
      setAccessToken(token);
      console.log("Access token:", token);

      try {
        const currentUser = await fetchCurrentUser(token);
        setUser(currentUser);
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    initialize();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Login failed");
    }
    const { accessToken: token } = await res.json();
    setAccessToken(token);
    try {
      const currentUser = await fetchCurrentUser(token);
      setUser(currentUser);
    } catch (e) {
      setUser(null);
    }
    message.success("Logged in");
  };

  const signup = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Signup failed");
    }
    message.success("Registered. Check email for verification.");
  };

  const logout = async () => {
    // optional: call backend to clear refresh cookie
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
    setUser(null);
    setAccessToken(null);
    message.info("Logged out");
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken, loading, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
