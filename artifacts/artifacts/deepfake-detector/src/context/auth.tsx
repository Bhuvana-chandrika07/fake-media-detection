import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  createAccount: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "auradetect_user";

const DEMO_ACCOUNTS = [
  { email: "admin@auradetect.ai", password: "admin123", name: "Admin" },
  { email: "demo@auradetect.ai", password: "demo1234", name: "Demo User" },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Clear any existing session to force login page
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 800));
    const account = DEMO_ACCOUNTS.find(
      (a) => a.email === email.toLowerCase() && a.password === password
    );
    if (!account) throw new Error("Invalid email or password.");
    const userData: User = { email: account.email, name: account.name };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const createAccount = async (email: string, password: string, name: string) => {
    await new Promise((r) => setTimeout(r, 800));
    const existingAccount = DEMO_ACCOUNTS.find(
      (a) => a.email === email.toLowerCase()
    );
    if (existingAccount) throw new Error("An account with this email already exists.");
    if (password.length < 6) throw new Error("Password must be at least 6 characters long.");
    
    // In a real app, this would create the account in a database
    // For demo purposes, we'll just simulate account creation
    const newAccount = { email: email.toLowerCase(), password, name };
    DEMO_ACCOUNTS.push(newAccount);
    
    const userData: User = { email: newAccount.email, name: newAccount.name };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, createAccount, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
