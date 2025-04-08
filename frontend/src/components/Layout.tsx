// Example implementation in a layout component
import React from 'react';
import { useDarkMode } from '../hooks/useDarkMode';
import DarkModeToggle from './DarkModeToggle';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 flex justify-between items-center">
        <h1>Lynx Notes</h1>
        <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      </header>
      <main>
        {children}
      </main>
    </div>
  );
};