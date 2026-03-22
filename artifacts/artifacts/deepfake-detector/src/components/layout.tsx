import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Shield, Upload, LayoutDashboard, History, Activity, LogOut, User, Settings, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/", label: "Home", icon: Activity },
    { href: "/upload", label: "Analyze", icon: Upload },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/history", label: "History", icon: History },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 inset-x-0 z-50 glass-panel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-wide hidden sm:block">
              Aura<span className="text-primary">Detect</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary shadow-[inset_0_0_20px_rgba(14,165,233,0.15)] border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:block">{item.label}</span>
                </Link>
              );
            })}

            {user && (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/10">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium text-foreground/80">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:block">Sign out</span>
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
        {children}
      </main>

      <footer className="fixed bottom-4 right-4 flex justify-end z-50 pointer-events-none">
        <Link
          href="/chatbot"
          className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 text-sm font-medium text-foreground shadow-lg shadow-black/20 hover:bg-white/15 transition"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Need help? Ask assistant</span>
        </Link>
      </footer>
    </div>
  );
}
