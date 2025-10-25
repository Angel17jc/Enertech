import { createContext, useContext, useEffect, ReactNode, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { profile, user } = useAuth();

  const initialTheme = profile?.theme || (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  const [theme, setTheme] = useState<'light' | 'dark'>(initialTheme as 'light' | 'dark');

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    // sincronizar si profile cambia
    if (profile?.theme && profile.theme !== theme) {
      setTheme(profile.theme as 'light' | 'dark');
    }
  }, [profile, theme]);

  const toggleTheme = async () => {
    const newTheme: 'light' | 'dark' = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);

    // persistir preferencia en BD si hay usuario
    if (user) {
      try {
        await supabase.from('profiles').update({ theme: newTheme }).eq('id', user.id);
      } catch (err) {
        console.error('Could not persist theme:', err);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
