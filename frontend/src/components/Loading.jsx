import { useEffect, useState } from "react";

const DEFAULT_MESSAGES = [
  "Warming up the kiln…",
  "Loading your workspace…",
  "Fetching your projects…",
  "Almost there…",
];

/* Uses the same saved light/dark choice as the rest of the app */
function useMode() {
  const [mode] = useState(() => {
    try {
      const saved = localStorage.getItem("kiln-theme");
      if (saved === "light" || saved === "dark") return saved;
    } catch {}
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  return mode;
}

const THEMES = {
  light: { page: "bg-slate-50 text-slate-900", muted: "text-slate-500", track: "bg-slate-200", ring: "border-slate-200" },
  dark: { page: "bg-[#0A1517] text-white", muted: "text-slate-400", track: "bg-white/10", ring: "border-white/10" },
};

function KilnLogo({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label="Kiln logo">
      <rect width="32" height="32" rx="9" fill="#0E1F22" />
      <path d="M12 9l-6 7 6 7M20 9l6 7-6 7" fill="none" stroke="#2BB5A6" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path
        className="kiln-flame"
        d="M16 10c2 2.5 3 4 3 6a3 3 0 11-6 0c0-1 .4-1.8 1.2-2.6.2 1 .8 1.4 1.3 1.4-.2-1.8.1-3.4.5-4.8z"
        fill="#FF9F43"
      />
    </svg>
  );
}

/**
 * Props:
 *  - message: string | string[]  – status text (arrays rotate every 2.2s)
 *  - fullScreen: boolean (default true) – set false to fill a parent container instead
 */
export default function Loading({ message = DEFAULT_MESSAGES, fullScreen = true }) {
  const t = THEMES[useMode()];
  const messages = Array.isArray(message) ? message : [message];
  const [i, setI] = useState(0);

  useEffect(() => {
    if (messages.length < 2) return;
    const id = setInterval(() => setI((n) => (n + 1) % messages.length), 2200);
    return () => clearInterval(id);
  }, [messages.length]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`relative flex items-center justify-center overflow-hidden px-4 ${fullScreen ? "min-h-screen" : "h-full min-h-[24rem]"} ${t.page}`}
    >
      <style>{`
        @keyframes kiln-slide { 0% { transform: translateX(-100%) } 100% { transform: translateX(350%) } }
        @keyframes kiln-fade { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: none } }
        @keyframes kiln-flicker { 0%,100% { transform: scale(1) } 50% { transform: scale(1.12) } }
        .kiln-flame { transform-box: fill-box; transform-origin: 50% 90%; animation: kiln-flicker 1.2s ease-in-out infinite }
        @media (prefers-reduced-motion: reduce) {
          .kiln-flame, .kiln-bar, .kiln-msg { animation: none !important }
        }
      `}</style>

      {/* background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-[#2BB5A6]/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-[#FF9F43]/10 blur-3xl" />

      <div className="relative flex flex-col items-center text-center">
        {/* logo with spinning ring */}
        <div className="relative flex h-28 w-28 items-center justify-center">
          <span className={`absolute inset-0 rounded-full border-2 ${t.ring}`} />
          <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#2BB5A6] border-r-[#2BB5A6]/40" style={{ animationDuration: "1.1s" }} />
          <KilnLogo className="h-16 w-16 drop-shadow-lg" />
        </div>

        <h1 className="mt-7 text-3xl font-bold tracking-tight">Kiln</h1>

        {/* rotating status text */}
        <p key={i} className={`kiln-msg mt-2 h-6 text-sm ${t.muted}`} style={{ animation: "kiln-fade .4s ease both" }}>
          {messages[i]}
        </p>

        {/* indeterminate progress bar */}
        <div className={`mt-6 h-1.5 w-48 overflow-hidden rounded-full ${t.track}`}>
          <div className="kiln-bar h-full w-1/3 rounded-full bg-gradient-to-r from-[#2BB5A6] to-[#FF9F43]" style={{ animation: "kiln-slide 1.3s ease-in-out infinite" }} />
        </div>
      </div>
    </div>
  );
}