import React from "react";
import { useTheme } from "../../theme/useTheme";
import styles from "./ThemeSwitcher.module.css";

export default function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div className={styles.themeSwitcher}>
      <select 
        value={theme} 
        onChange={(e) => setTheme(e.target.value)}
        className={styles.themeSelect}
      >
        {themes.map((t) => (
          <option key={t.id} value={t.id}> {/* ✅ Agregado key */}
            {t.label}
          </option>
        ))}
      </select>
    </div>
  );
}