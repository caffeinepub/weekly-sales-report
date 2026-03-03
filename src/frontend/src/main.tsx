import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import App from "./App";
// CRITICAL: RBACProvider must always remain here — removing it causes an instant app crash
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
  <QueryClientProvider client={queryClient}>
    <InternetIdentityProvider>
      {/* CRITICAL: RBACProvider must stay here — do not remove */}
      <RBACProvider>
        <App />
      </RBACProvider>
    </InternetIdentityProvider>
  </QueryClientProvider>,
);
