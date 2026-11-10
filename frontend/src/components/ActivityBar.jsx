import { useT } from "../utils/theme.js";
import { FilesIcon, BotIcon, SquareTerminalIcon } from "./icons";

export default function ActivityBar({ explorerOpen, chatOpen, terminalOpen, onExplorer, onChat, onTerminal }) {
  const t = useT();
  const items = [
    ["Explorer", FilesIcon, explorerOpen, onExplorer],
    ["AI Chat", BotIcon, chatOpen, onChat],
    ["Terminal", SquareTerminalIcon, terminalOpen, onTerminal],
  ];
  return (
    <nav aria-label="Activity bar" className={`flex w-14 shrink-0 flex-col items-center gap-2 border-r py-3 ${t.bar}`}>
      {items.map(([label, Ico, on, onClick]) => (
        <button
          key={label}
          type="button"
          onClick={onClick}
          title={label}
          aria-label={label}
          aria-pressed={on}
          className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2BB5A6] ${
            on ? "bg-[#2BB5A6]/15 text-[#2BB5A6]" : t.icon
          }`}
        >
          {on && <span className="absolute -left-2 h-5 w-0.5 rounded-full bg-[#2BB5A6]" />}
          <Ico size={20} />
        </button>
      ))}
    </nav>
  );
}
