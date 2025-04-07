import React, { useState, useEffect } from 'react';
import HomePage from "./components/HomePage";
import DarkModeToggle from "./components/DarkModeToggle";
import DevTools from "./components/DevTools";
import ApiTester from "./components/tests/ApiTester";
import NetworkHealth from "./components/NetworkHealth";
import QRCodeDisplay from "./components/QRCodeDisplay";
import SplashScreen from "./components/SplashScreen";

export function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Check if we're in development mode
  const isDev = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' || 
                window.location.hostname === '192.168.50.131';
                
  return (
    <div className="min-h-screen bg-background text-text">
      <div className="fixed top-4 right-4 z-50">
        <DarkModeToggle />
      </div>
      {showSplash ? <SplashScreen /> : <HomePage />}
      {isDev && <ApiTester />}          
      {isDev && <DevTools />}  
      <NetworkHealth />
      <QRCodeDisplay />
    </div>
  );
}

export default App;
