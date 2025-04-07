console.log("Lynx Notes App initialized");

import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.js";
import { ToastProvider } from "./components/Toast.js";

// CSS imports can be commented out as we're handling them separately 
// through the build process to avoid bundling issues
// import './styles/App.css';
// import './styles/global.css';

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ToastProvider>
        <App />
      </ToastProvider>
    </React.StrictMode>
  );
} else {
  console.error("Root element not found");
}