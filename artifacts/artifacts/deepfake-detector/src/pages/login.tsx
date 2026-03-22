import { useState, FormEvent } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Shield, Mail, Lock, Loader2, AlertCircle, Eye, EyeOff, User } from "lucide-react";
import { useAuth } from "@/context/auth";

export default function Login() {
  const { login, createAccount } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    if (isCreateMode && !name) {
      setError("Please enter your name.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      if (isCreateMode) {
        await createAccount(email, password, name);
      } else {
        await login(email, password);
      }
      setLocation("/");
    } catch (err: any) {
      setError(err.message || `${isCreateMode ? 'Account creation' : 'Login'} failed. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail("demo@auradetect.ai");
    setPassword("demo1234");
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(14,165,233,0.03)_0%,_transparent_70%)]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(14,165,233,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-accent shadow-lg shadow-primary/30 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold">
            Aura<span className="text-primary">Detect</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Sign in to access the detection platform
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground/80">
                {isCreateMode ? "Create Account" : "Sign In"}
              </label>
              
              {isCreateMode && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-foreground/80">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      autoComplete="name"
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-background/50 border border-white/10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all disabled:opacity-50"
                    />
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-foreground/80">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-background/50 border border-white/10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground/80">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isLoading}
                    className="w-full pl-10 pr-12 py-3 rounded-xl bg-background/50 border border-white/10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 text-destructive text-sm bg-destructive/10 px-4 py-3 rounded-xl border border-destructive/20"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isCreateMode ? "Creating account…" : "Signing in…"}
                </>
              ) : (
                isCreateMode ? "Create Account" : "Sign In"
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsCreateMode(!isCreateMode);
                  setError(null);
                  setName("");
                  setEmail("");
                  setPassword("");
                }}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                {isCreateMode 
                  ? "Already have an account? Sign in" 
                  : "Don't have an account? Create one"
                }
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-muted-foreground text-center mb-3">Demo credentials</p>
            <button
              onClick={fillDemo}
              className="w-full text-sm py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors font-mono text-muted-foreground hover:text-foreground"
            >
              demo@auradetect.ai / demo1234
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          AuraDetect · AI Fake Media Detection Platform
        </p>
      </motion.div>
    </div>
  );
}
