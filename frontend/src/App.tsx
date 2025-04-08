import React, { useState, useEffect } from 'react';
import HomePage from "./components/HomePage";
import DarkModeToggle from "./components/DarkModeToggle";
import DevTools from "./components/DevTools";
import ApiTester from "./components/tests/ApiTester";
import NetworkHealth from "./components/NetworkHealth";

export function App() {
  const [showDevTools, setShowDevTools] = useState(false);
  
  // Check if we're in development mode
  useEffect(() => {
    const hostname = window.location.hostname;
    const isDev = hostname === 'localhost' || 
                  hostname === '127.0.0.1' || 
                  hostname.includes('192.168');
    setShowDevTools(isDev);
  }, []);
                
  return (
    <div className="min-h-screen bg-background text-text">
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
      
      {/* Network status - show on all environments but separate from dev tools */}
      <div className="fixed bottom-4 left-4 z-40">
        <NetworkHealth />
      </div>
    </div>
  );
}

export default App;