import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  PropsWithChildren,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";

type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  theme: ThemeMode;
  toggleTheme: () => void;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = "@app_theme_mode";

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load theme từ storage hoặc dùng system preference
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === "light" || savedTheme === "dark") {
          setTheme(savedTheme);
        } else {
          // Nếu chưa có preference, dùng system theme
          setTheme(systemColorScheme === "dark" ? "dark" : "light");
        }
      } catch (error) {
        console.error("Failed to load theme:", error);
        setTheme("light");
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, [systemColorScheme]);

  const toggleTheme = async () => {
    const newTheme: ThemeMode = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  };

  const value: ThemeContextValue = {
    theme,
    toggleTheme,
    isDark: theme === "dark",
  };

  if (isLoading) {
    // Có thể return loading indicator nếu cần
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}