import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import App from "./App";
// CRITICAL: RBACProvider MUST remain here — removing it causes a blank screen crash
import { RBACProvider } from "./context/RBACContext";
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

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  // CRITICAL: Do NOT remove RBACProvider — App.tsx depends on useRBAC() hook
  <QueryClientProvider client={queryClient}>
    <InternetIdentityProvider>
      <RBACProvider>
        <App />
      </RBACProvider>
    </InternetIdentityProvider>
  </QueryClientProvider>,
);
