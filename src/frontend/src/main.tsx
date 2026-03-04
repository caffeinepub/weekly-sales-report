import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Component, type ReactNode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import "../index.css";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

// ─── Error Boundary ──────────────────────────────────────────────────────────
// Catches any runtime React errors and shows a visible fallback instead of
// a blank white screen.
class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "2rem",
            fontFamily: "sans-serif",
            color: "#374151",
            backgroundColor: "#f9fafb",
          }}
        >
          <div
            style={{
              maxWidth: 480,
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: "2rem",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
            <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 600 }}>
              Something went wrong
            </h2>
            <p style={{ margin: "0 0 16px", fontSize: 14, color: "#6b7280" }}>
              The app encountered an error. Try refreshing the page.
            </p>
            <pre
              style={{
                background: "#f3f4f6",
                borderRadius: 8,
                padding: "0.75rem",
                fontSize: 12,
                textAlign: "left",
                overflowX: "auto",
                color: "#dc2626",
              }}
            >
              {(this.state.error as Error).message}
            </pre>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                marginTop: 16,
                padding: "8px 20px",
                background: "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
// ─────────────────────────────────────────────────────────────────────────────

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <InternetIdentityProvider>
        <App />
      </InternetIdentityProvider>
    </QueryClientProvider>
  </ErrorBoundary>,
);
