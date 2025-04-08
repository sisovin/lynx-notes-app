import React, { useState, useEffect } from 'react';
import HomePage from "./components/HomePage";
import DarkModeToggle from "./components/DarkModeToggle";
import DevTools from "./components/DevTools";
import ApiTester from "./components/tests/ApiTester";
import NetworkHealth from "./components/NetworkHealth";
import SplashScreen from "./components/SplashScreen";

export function App() {
  // Combine the states from both versions
  const [showDevTools, setShowDevTools] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Splash screen timer from the main branch
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);
  
  // Check if we're in development mode (from your local version)
  useEffect(() => {
    const hostname = window.location.hostname;
    const isDev = hostname === 'localhost' || 
                  hostname === '127.0.0.1' || 
                  hostname.includes('192.168');
    setShowDevTools(isDev);
  }, []);
  
  // Render both the splash screen and the main content
  // The splash screen will hide after 3 seconds thanks to the timer
  return (
    <div className="min-h-screen bg-background text-text">
      {showSplash ? (
        <SplashScreen />
      ) : (
        <>
          {/* Dark mode toggle - always show this */}
          <div className="fixed top-4 right-4 z-50">
            <DarkModeToggle />
          </div>
          
          {/* Main content */}
          <HomePage />
          
          {/* Dev tools - only show in development mode */}
          {showDevTools && (
            <>
              <ApiTester />
              <DevTools />
            </>
          )}
          
          {/* Network status - show on all environments */}
          <div className="fixed bottom-4 left-4 z-40">
            <NetworkHealth />
          </div>          
        </>
      )}
    </div>
  );
}

export default App;