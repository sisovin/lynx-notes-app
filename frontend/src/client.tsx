console.log("Lynx Notes App initialized");

import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.js";
import { ToastProvider } from "./components/Toast.js";

// Don't import CSS files here - they're loaded via HTML

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    // Comment out StrictMode temporarily to test
    // <React.StrictMode>
      <ToastProvider>
        <App />
      </ToastProvider>
    // </React.StrictMode>
  );
} else {
  console.error("Root element not found");
}