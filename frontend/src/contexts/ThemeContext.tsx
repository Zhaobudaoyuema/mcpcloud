import React, { createContext, useContext, ReactNode } from 'react';

type Theme = 'light';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Always use warm light theme — dark mode removed for consistent warm UI
  const theme: Theme = 'light';

  // Ensure dark class is never present on the HTML element
  if (typeof window !== 'undefined') {
    window.document.documentElement.classList.remove('dark');
    // Clear any inline body backgroundColor that may have been set by a previous dark mode session
    document.body.style.backgroundColor = '';
    // Also clear any stale localStorage preference
    localStorage.removeItem('theme');
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: () => {}, resolvedTheme: 'light' }}>
      {children}
    </ThemeContext.Provider>
  );
};
