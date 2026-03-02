import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { Loader2, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

export default function Login() {
  const { login, loginStatus, isInitializing } = useInternetIdentity();

  const isLoading = isInitializing || loginStatus === "logging-in";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        {/* Login card */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-8 space-y-8">
          {/* Brand */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-glow">
              <TrendingUp className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-foreground tracking-tight">
                SalesPulse
              </h1>
              <p className="text-sm text-muted-foreground font-medium mt-0.5">
                Weekly Report
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Welcome message */}
          <div className="text-center space-y-1">
            <h2 className="font-display font-semibold text-lg text-foreground">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Secure access to your weekly sales pipeline. Sign in to continue.
            </p>
          </div>

          {/* Sign in button */}
          <button
            type="button"
            onClick={login}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground font-semibold text-sm px-5 py-3 rounded-xl transition-all duration-150 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isInitializing ? "Initializing…" : "Signing in…"}
              </>
            ) : (
              <>
                <div className="w-5 h-5 flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 opacity-90"
                    aria-hidden="true"
                  >
                    <path d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zm0 2c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9zm0 3a4 4 0 0 0-4 4v1H7a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1h-1v-1a4 4 0 0 0-4-4zm0 2a2 2 0 0 1 2 2v1h-4v-1a2 2 0 0 1 2-2z" />
                  </svg>
                </div>
                Sign in with Internet Identity
              </>
            )}
          </button>

          {/* Info note */}
          <p className="text-center text-xs text-muted-foreground">
            Your first sign-in will grant you admin access.
            <br />
            Subsequent users require admin approval.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}
