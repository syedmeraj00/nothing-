import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (!saved) return false;
    
    try {
      return JSON.parse(saved);
    } catch {
      // Handle legacy string values
      return saved === 'dark';
    }
  });

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const newTheme = !prev;
      localStorage.setItem('theme', JSON.stringify(newTheme));
      return newTheme;
    });
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};