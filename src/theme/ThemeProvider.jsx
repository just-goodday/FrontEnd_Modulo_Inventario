// theme/ThemeProvider.jsx
import React, { useEffect, useMemo, useState } from "react";
import { ConfigProvider, theme as antdTheme } from "antd";
import { ThemeContext, THEMES } from "./ThemeContext";

const isBrowser = typeof window !== "undefined";

export default function ThemeProvider({ children, defaultTheme = "light" }) {
  const [theme, setTheme] = useState(() => {
    if (!isBrowser) return defaultTheme;
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : defaultTheme;
  });

  // 🔥 KEY PARA FORZAR RE-MOUNT AL CAMBIAR TEMA
  const [configKey, setConfigKey] = useState(0);

  // (Opcional) si quieres tema "system", reactualiza cuando cambia el SO
  useEffect(() => {
    if (!isBrowser) return;
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      document.documentElement.setAttribute("data-theme", mq.matches ? "dark" : "light");
      setConfigKey(prev => prev + 1); // 🔥 Forzar re-mount
    };
    handler();
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, [theme]);

  // Sincroniza data-theme + persistencia
  useEffect(() => {
    if (!isBrowser) return;
    const applied = theme === "system"
      ? (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;

    document.documentElement.setAttribute("data-theme", applied);
    localStorage.setItem("theme", theme);
    
    // 🔥 FORZAR RE-MOUNT DEL CONFIG PROVIDER AL CAMBIAR TEMA
    setConfigKey(prev => prev + 1);
  }, [theme]);

  // Tokens globales (usa tus CSS vars)
  const tokens = useMemo(() => ({
    colorPrimary: "#13c888",
    colorBgContainer: "var(--card)",
    colorBorder: "var(--border)",
    colorText: "var(--text)",
    colorTextSecondary: "var(--text-secondary)",
    borderRadius: 10,
  }), []);

  // Algoritmo según tema (dark/default). "datastore" usa dark por ahora.
  const algorithm = useMemo(() => {
    const applied = theme === "system"
      ? (isBrowser && window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;

    const isDark = applied === "dark" || applied === "datastore";
    return isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm;
  }, [theme]);

  // Overrides por componente (opcional)
  const components = useMemo(() => ({
    Button: { 
      borderRadius: 10, 
      controlHeight: 36 
    },
    Card: { 
      borderRadiusLG: 14 
    },
    Input: { 
      borderRadius: 8 
    },
    Modal: { 
      borderRadiusLG: 14 
    }
  }), []);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      themes: THEMES,
      toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {/* 🔥 KEY ÚNICA PARA FORZAR RE-MOUNT COMPLETO */}
      <ConfigProvider 
        key={`config-${configKey}`}
        theme={{ 
          algorithm, 
          token: tokens, 
          components 
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}