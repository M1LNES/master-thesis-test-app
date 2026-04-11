import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { BugProvider } from "./context/BugContext.tsx";
import { Toaster } from "./components/ui/toaster.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BugProvider>
      <AuthProvider>
        <App />
        <Toaster />
      </AuthProvider>
    </BugProvider>
  </StrictMode>,
);
