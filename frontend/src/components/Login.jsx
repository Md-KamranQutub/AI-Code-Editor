import { useEffect, useState } from "react";
import { login } from "../features/login.js";
import {signInWithPopup} from 'firebase/auth'
import {auth, googleProvider} from '../../firebase.js'
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice.js";

/* ---------- Theme palettes (edit colours here) ---------- */
const THEMES = {
  light: {
    page: "bg-slate-50",
    card: "border-slate-200 bg-white shadow-xl shadow-slate-900/5",
    title: "text-slate-900",
    muted: "text-slate-500",
    link: "hover:text-slate-800",
    button:
      "border-slate-300 bg-white text-slate-800 hover:border-[#2BB5A6]",
    toggle: "border-slate-200 bg-white text-slate-600 hover:text-slate-900",
    glowA: "bg-[#2BB5A6]/20",
    glowB: "bg-[#FF9F43]/15",
  },
  dark: {
    page: "bg-[#0A1517]",
    card: "border-white/10 bg-[#112123] shadow-xl shadow-black/30",
    title: "text-white",
    muted: "text-slate-400",
    link: "hover:text-white",
    button:
      "border-white/15 bg-white/5 text-white hover:border-[#2BB5A6]",
    toggle: "border-white/10 bg-white/5 text-slate-300 hover:text-white",
    glowA: "bg-[#2BB5A6]/15",
    glowB: "bg-[#FF9F43]/10",
  },
};

function useTheme() {
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

  return [theme, () => setTheme((t) => (t === "dark" ? "light" : "dark"))];
}

function KilnLogo({ className = "h-12 w-12" }) {
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label="Kiln logo">
      <rect width="32" height="32" rx="9" fill="#0E1F22" />
      <path
        d="M12 9l-6 7 6 7M20 9l6 7-6 7"
        fill="none"
        stroke="#2BB5A6"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 10c2 2.5 3 4 3 6a3 3 0 11-6 0c0-1 .4-1.8 1.2-2.6.2 1 .8 1.4 1.3 1.4-.2-1.8.1-3.4.5-4.8z"
        fill="#FF9F43"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
      <path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 019.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 000 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
    </svg>
  );
}

/**
 * Props:
 *  - onGoogleLogin: function that starts your Firebase Google sign-in
 *  - loading: optional boolean to show a spinner while signing in
 */
export default function Login() {
  const [mode, toggleTheme] = useTheme();
  const [loading, setLoading] = useState(false);
  const t = THEMES[mode];
  const dispatch = useDispatch();

  const handleLogin = async()=>{
    setLoading(true);
    try{
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      const user = await login(token);
      console.log(user);
      dispatch(setUserData(user));
    }catch(error){
      console.error("Login failed:", error);
    }finally{
      setLoading(false);
    }
  }
  return (
    <div
      className={`relative flex min-h-screen items-center justify-center overflow-hidden px-4 transition-colors duration-300 ${t.page}`}
    >
      {/* background glow */}
      <div className={`pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full blur-3xl ${t.glowA}`} />
      <div className={`pointer-events-none absolute -bottom-40 right-0 h-80 w-80 rounded-full blur-3xl ${t.glowB}`} />

      {/* theme toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2BB5A6]/40 ${t.toggle}`}
      >
        {mode === "dark" ? <SunIcon /> : <MoonIcon />}
      </button>

      <div
        className={`relative w-full max-w-sm rounded-3xl border p-8 transition-colors duration-300 sm:p-10 ${t.card}`}
      >
        <div className="flex flex-col items-center text-center">
          <KilnLogo className="h-16 w-16 drop-shadow-md" />
          <h1 className={`mt-5 text-3xl font-bold tracking-tight ${t.title}`}>Kiln</h1>
          <p className={`mt-1 text-sm ${t.muted}`}>The AI code editor</p>
        </div>

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className={`cursor-pointer mt-9 flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3.5 text-base font-semibold transition hover:shadow-[0_0_0_4px_rgba(43,181,166,0.15)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2BB5A6]/40 active:translate-y-px disabled:cursor-progress disabled:opacity-70 ${t.button}`}
        >
          {loading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[#2BB5A6]" />
          ) : (
            <GoogleIcon />
          )}
          {loading ? "Signing you in…" : "Continue with Google"}
        </button>

        <p className={`mt-6 text-center text-xs leading-relaxed ${t.muted}`}>
          By continuing, you agree to our{" "}
          <a href="/terms" className={`underline underline-offset-2 ${t.link}`}>Terms</a>{" "}
          and{" "}
          <a href="/privacy" className={`underline underline-offset-2 ${t.link}`}>Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}