import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./components/ui/Toast.jsx";
import "./index.css";
import "@mantine/core/styles.css";
import { theme } from "./theme/mantineTheme.js";

// main_v1: Static mock-only branch.
// No backend URL, no mock loader, no API calls.
// All data comes from inline MOCK_* constants in each screen.
// New backend will be wired on a separate branch when service is ready.

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: Infinity,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <MantineProvider theme={theme} defaultColorScheme="light" cssVariablesResolver={() => ({ variables: {}, light: { "--mantine-color-body": "#f1f5f9" }, dark: { "--mantine-color-body": "#0f172a" } })}>
          <AuthProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </AuthProvider>
        </MantineProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);