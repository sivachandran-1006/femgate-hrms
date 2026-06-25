import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./components/ui/Toast.jsx";
import "./index.css";
import "@mantine/core/styles.css";
import { theme } from "./theme/mantineTheme.js";
import { enableMockMode } from "./config/MockConfig.js";
import { loadMockData } from "./mocks/mockLoader.js";

// Only enable mock mode in local development when no API URL is set
if (!import.meta.env.VITE_API_URL) {
  enableMockMode(loadMockData);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5,
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
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);