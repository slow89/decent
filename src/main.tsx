import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AppProviders } from "@/app/providers";
import { AppRouter } from "@/router";
import { initializeTheme } from "@/stores/theme-store";
import "@/styles.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Missing root container");
}

initializeTheme();

createRoot(container).render(
  <StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </StrictMode>,
);
