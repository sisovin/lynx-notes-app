import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SplashScreen from "./components/SplashScreen";
import NotesPage from "./pages/NotesPage";
import LoginPage from "./pages/LoginPage";
import DarkModeToggle from "./components/DarkModeToggle";
import ToggleSidebar from "./components/ToggleSidebar";
import "./styles/App.css";

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize dark mode based on saved preference or system preference
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    return savedTheme === "dark" || (!savedTheme && prefersDark);
  });

  // Initialize dark mode on first render
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Splash screen timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);

      // Re-apply dark mode after splash screen
      const savedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const shouldBeDark =
        savedTheme === "dark" || (!savedTheme && prefersDark);

      if (shouldBeDark) {
        document.documentElement.classList.add("dark");
        setIsDarkMode(true);
      } else {
        document.documentElement.classList.remove("dark");
        setIsDarkMode(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Check if we're in development mode
  useEffect(() => {
    const hostname = window.location.hostname;
    const isDev =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.includes("192.168");
  }, []);

  // Toggle dark mode function to pass to DarkModeToggle
  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      if (newMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return newMode;
    });
  };

  // Define sidebar items with SVG icons
  const sidebarItems = [
    {
      id: "home",
      label: "Home",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      ),
      link: "/notes",
    },
    {
      id: "favorites",
      label: "Favorites",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      ),
      link: "/favorites",
    },
    {
      id: "tags",
      label: "Tags",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
          <line x1="7" y1="7" x2="7.01" y2="7"></line>
        </svg>
      ),
      link: "/tags",
    },
    {
      id: "settings",
      label: "Settings",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      ),
      link: "/settings",
    },
  ];

  // In your return statement, add the ToggleSidebar component
  return (
    <Router>
      <div className="App">
        {showSplash ? (
          <SplashScreen darkMode={isDarkMode} />
        ) : (
          <>
            {/* Dark mode toggle - always show this */}
            <div className="fixed top-4 right-4 z-50">
              <DarkModeToggle
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
              />
            </div>

            {/* Add the sidebar component */}
            <ToggleSidebar
              items={sidebarItems}
              showOnHover={false}
              defaultOpen={false}
              position="left"
            />

            <Routes>
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/" element={<LoginPage />} />
            </Routes>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
