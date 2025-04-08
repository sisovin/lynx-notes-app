import React, { useEffect, useState } from "react";

const NetworkHealth: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);
  
  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  if (isOnline) return null;
  
  return (
    <div className="fixed bottom-0 w-full p-4 bg-red-500 text-white text-center">
      You're offline. Some features may not work.
      <div className="mt-2">
      <button 
        onClick={handleOnline} 
        className="mx-2 px-3 py-1 bg-white text-red-500 rounded"
      >
        Reconnect
      </button>
      <button 
        onClick={handleOffline} 
        className="mx-2 px-3 py-1 bg-white text-red-500 rounded"
      >
        Test Offline
      </button>
      </div>
    </div>
  );
};

export default NetworkHealth;