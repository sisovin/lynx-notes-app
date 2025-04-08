// Import the CSS files
import "./index.css";
import "./styles/SplashScreen.css";

console.log("Lynx Notes App initialized");

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ToastProvider } from "./components/Toast.js";

// Function to apply dark mode on initial load
const initializeDarkMode = () => {
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);
  
  if (shouldBeDark) {
    document.documentElement.classList.add("dark");
    console.log("Dark mode initialized: ON");
  } else {
    document.documentElement.classList.remove("dark");
    console.log("Dark mode initialized: OFF");
  }
  
  // For debugging
  setTimeout(() => {
    const isDark = document.documentElement.classList.contains("dark");
    console.log("Dark mode class applied:", isDark);
    console.log("Current CSS variables:", {
      background: getComputedStyle(document.documentElement).getPropertyValue('--background'),
      textColor: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
      cardBackground: getComputedStyle(document.documentElement).getPropertyValue('--card-background')
    });
  }, 100);
};

// Run dark mode initialization immediately
initializeDarkMode();

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <ToastProvider>
      <App />
    </ToastProvider>
  );
}