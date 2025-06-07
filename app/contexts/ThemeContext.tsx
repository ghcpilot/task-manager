'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: true,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Apply theme classes to document
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const htmlElement = document.documentElement;
      const bodyElement = document.body;
      
      if (isDarkMode) {
        htmlElement.classList.remove('light');
        htmlElement.classList.add('dark');
        bodyElement.classList.remove('light');
        bodyElement.classList.add('dark');
        bodyElement.style.backgroundColor = '#0a0a0a';
        bodyElement.style.color = '#ffffff';
        
        // Set toast variables for dark mode
        htmlElement.style.setProperty('--toast-bg', '#1a1a1a');
        htmlElement.style.setProperty('--toast-color', '#fff');
        htmlElement.style.setProperty('--toast-border', 'rgba(255,255,255,0.1)');
      } else {
        htmlElement.classList.remove('dark');
        htmlElement.classList.add('light');
        bodyElement.classList.remove('dark');
        bodyElement.classList.add('light');
        bodyElement.style.backgroundColor = '#f9fafb';
        bodyElement.style.color = '#111827';
        
        // Set toast variables for light mode
        htmlElement.style.setProperty('--toast-bg', '#ffffff');
        htmlElement.style.setProperty('--toast-color', '#111827');
        htmlElement.style.setProperty('--toast-border', 'rgba(0,0,0,0.1)');
      }
      
      // Save theme preference
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }
  }, [isDarkMode]);

  // Load theme preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        const isDark = savedTheme === 'dark';
        setIsDarkMode(isDark);
      } else {
        // Default to dark mode if no preference is saved
        setIsDarkMode(true);
      }
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const setTheme = (isDark: boolean) => {
    setIsDarkMode(isDark);
  };

  const value = {
    isDarkMode,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 