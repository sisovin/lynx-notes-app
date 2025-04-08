import { useState } from 'react';

const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark" || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      if (newMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
        
        // Debugging: check computed styles
        console.log("Dark mode ON - background color:", 
          getComputedStyle(document.documentElement).getPropertyValue('--background'));
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
        
        // Debugging: check computed styles
        console.log("Dark mode OFF - background color:", 
          getComputedStyle(document.documentElement).getPropertyValue('--background'));
      }
      return newMode;
    });
  };

  return { isDarkMode, toggleDarkMode };
};

export default useDarkMode;