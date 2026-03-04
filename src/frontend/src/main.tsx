// CRITICAL: RBACProvider must remain here — removing it breaks the app
import { RBACProvider } from "@/context/RBACContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import App from "./App";
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
    {/* CRITICAL: RBACProvider must wrap App — do not remove */}
    <RBACProvider>
      <App />
    </RBACProvider>
  </QueryClientProvider>,
);
