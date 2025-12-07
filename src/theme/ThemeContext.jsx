// theme/ThemeContext.js
import { createContext } from "react";

export const THEMES = [
  { id: "light", label: "Claro" },
  { id: "dark", label: "Oscuro" },
  { id: "datastore", label: "DataStore" },
  // { id: "system", label: "Sistema" }, // opcional
];

export const ThemeContext = createContext(null);
