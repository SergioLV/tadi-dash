"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { isAuthenticated, login as doLogin, logout as doLogout } from "@/lib/auth";

interface AuthContextType {
  authenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  authenticated: false,
  loading: true,
  login: () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setLoading(false);
  }, []);

  const login = (email: string, password: string) => {
    const ok = doLogin(email, password);
    if (ok) setAuthenticated(true);
    return ok;
  };

  const logout = () => {
    doLogout();
    setAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ authenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
