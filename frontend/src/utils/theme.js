import { createContext, useContext, useEffect, useState } from "react";

/* Same light/dark storage key as the login page + dashboard */
export const THEMES = {
  light: {
    page: "bg-slate-100 text-slate-900",
    bar: "border-slate-200 bg-white",
    side: "border-slate-200 bg-white",
    main: "bg-slate-50",
    term: "border-slate-200 bg-white",
    border: "border-slate-200",
    muted: "text-slate-500",
    hover: "hover:bg-slate-100",
    active: "bg-slate-100 text-slate-900",
    idle: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    icon: "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
    soft: "bg-slate-100",
    input: "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400",
    code: "bg-white text-slate-800 caret-slate-900",
    gutter: "border-slate-200 bg-slate-50 text-slate-400",
    user: "bg-[#2BB5A6] text-[#06201D]",
    ai: "bg-slate-100 text-slate-800",
    avatar: "bg-slate-900 text-white",
  },
  dark: {
    page: "bg-[#0A1517] text-white",
    bar: "border-white/10 bg-[#0D1B1D]",
    side: "border-white/10 bg-[#0C1A1C]",
    main: "bg-[#091214]",
    term: "border-white/10 bg-[#070E10]",
    border: "border-white/10",
    muted: "text-slate-400",
    hover: "hover:bg-white/5",
    active: "bg-white/10 text-white",
    idle: "text-slate-300 hover:bg-white/5 hover:text-white",
    icon: "text-slate-400 hover:bg-white/10 hover:text-white",
    soft: "bg-white/5",
    input: "border-white/15 bg-white/5 text-white placeholder:text-slate-500",
    code: "bg-[#091214] text-slate-200 caret-white",
    gutter: "border-white/10 bg-[#0B181A] text-slate-600",
    user: "bg-[#2BB5A6] text-[#06201D]",
    ai: "bg-white/5 text-slate-200",
    avatar: "bg-white text-slate-900",
  },
};

export const ThemeCtx = createContext(THEMES.dark);
export const useT = () => useContext(ThemeCtx);

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem("kiln-theme");
      if (saved === "light" || saved === "dark") return saved;
    } catch {}
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  useEffect(() => {
    try {
      localStorage.setItem("kiln-theme", theme);
    } catch {}
  }, [theme]);
  return [theme, () => setTheme((m) => (m === "dark" ? "light" : "dark"))];
}
