import { useT } from "../utils/theme.js";
import { KilnLogo, FolderIcon, SparkIcon, SquareTerminalIcon, SunIcon, MoonIcon } from "./icons";

const initials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "U";

export default function ProjectHeader({
  projectName, user, mode, onToggleTheme, onBack,
  terminalOpen, onToggleTerminal, chatOpen, onToggleChat,
}) {
  const t = useT();
  const toggle = (on) =>
    `flex h-9 w-9 items-center justify-center rounded-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2BB5A6] ${
      on ? "bg-[#2BB5A6]/15 text-[#2BB5A6]" : t.icon
    }`;

  return (
    <header className={` flex h-14 shrink-0 items-center justify-between gap-3 border-b px-3 sm:px-4 ${t.bar}`}>
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={onBack} aria-label="Back to dashboard" className="flex items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2BB5A6]">
          <KilnLogo className="h-8 w-8" />
          <span className="hidden text-lg font-bold tracking-tight sm:block">Kiln</span>
        </button>
        <span className={`h-6 w-px ${t.soft}`} />
        <div className={`flex min-w-0 items-center gap-2 rounded-lg px-2.5 py-1.5 ${t.soft}`}>
          <FolderIcon size={16} className="shrink-0 text-amber-500" />
          <span className="truncate text-sm font-medium">{projectName}</span>
          <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" title="Connected" />
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button type="button" onClick={onToggleChat} aria-pressed={chatOpen} aria-label="Toggle AI chat" title="AI chat" className={toggle(chatOpen)}>
          <SparkIcon />
        </button>
        <button type="button" onClick={onToggleTerminal} aria-pressed={terminalOpen} aria-label="Toggle terminal" title="Terminal" className={toggle(terminalOpen)}>
          <SquareTerminalIcon />
        </button>
        <button type="button" onClick={onToggleTheme} aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"} className={toggle(false)}>
          {mode === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
        {user?.photoURL ? (
          <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="ml-1 h-9 w-9 rounded-full object-cover" />
        ) : (
          <span className={`ml-1 flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${t.avatar}`}>{initials(user?.name)}</span>
        )}
      </div>
    </header>
  );
}
