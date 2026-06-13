import { createContext, useContext, useState } from "react";
import { COLORS } from "../theme/colors";
import { FONT_FAMILY } from "../theme/fonts";

const ThemeContext = createContext(null);

const buildTheme = (darkMode) => {
  const surface = darkMode ? COLORS.dark : COLORS.light;
  return {
    darkMode,
    ...surface,
    fontFamily: FONT_FAMILY.base,
    primary:    COLORS.primary,
    success:    COLORS.success,
    warning:    COLORS.warning,
    danger:     COLORS.danger,
    info:       COLORS.info,
    purple:     COLORS.purple,
  };
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const theme = buildTheme(darkMode);

  return (
    <ThemeContext.Provider value={{ theme, darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
};

// Convenience: build a theme object from a darkMode boolean (for components using prop)
export const getTheme = (darkMode = false) => buildTheme(darkMode);
