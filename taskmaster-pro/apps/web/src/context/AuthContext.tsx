import { createContext, useContext, useMemo, useState } from "react";

const TOKEN_STORAGE_KEY = "taskmaster_pro_token";

type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  login: (nextToken: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      login: (nextToken: string) => {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
        setToken(nextToken);
      },
      logout: () => {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
      },
    }),
    [token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
