"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'white' | 'night';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setTheme] = useState<Theme>('night');

    useEffect(() => {
        const savedTheme = localStorage.getItem('fin-core-theme') as Theme;
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []);

    const handleSetTheme = (newTheme: Theme) => {
        setTheme(newTheme);
        localStorage.setItem('fin-core-theme', newTheme);
    };

    const toggleTheme = () => {
        const newTheme = theme === "white" ? "night" : "white";
        handleSetTheme(newTheme);
    };

    return (
      <ThemeContext.Provider
        value={{ theme, setTheme: handleSetTheme, toggleTheme }}
      >
        <div className={theme === "night" ? "theme-night" : "theme-white"}>
          {children}
        </div>
      </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
