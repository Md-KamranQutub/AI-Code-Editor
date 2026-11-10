import { useEffect, useRef, useState } from "react";
import { useT } from "../utils/theme.js";
import { SendIcon, SparkIcon, TrashIcon, XIcon } from "./icons";
import { chat } from "../features/ai.js";

const SUGGESTIONS = ["Build a to-do app", "Make a landing page", "Add a dark mode toggle"];
const uid = () => Math.random().toString(36).slice(2);

const FILE_EVENTS = new Set(["create_folder", "create_file", "file_updated", "file_deleted"]);

const statusFor = (tool) =>
  ({
    get_tree: "Reading project…",
    get_file: "Reading file…",
    create_folder: "Creating folder…",
    create_file: "Creating file…",
    update_file: "Updating file…",
    delete_file: "Deleting file…",
  })[tool] || "Working…";

/* Props:
 *  - projectId: the project the AI works on
 *  - onFileEvent(type, data): called for create_folder / create_file / file_updated / file_deleted
 *    so the parent can update the file tree and editor (data.file or data.folder)
 *  - onClose: optional, shows a close button (handy on mobile)
 */
export default function ChatPanel({ projectId, onFileEvent, onClose }) {
  const t = useT();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");
  const areaRef = useRef(null);
  const endRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [messages, sending, status]);

  // cancel any running request when the panel unmounts
  useEffect(() => () => abortRef.current?.abort(), []);

  // auto-grow textarea (max ~6 lines)
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }, [input]);

  const clearChat = () => {
    abortRef.current?.abort();
    setMessages([]);
  };

  const send = async (raw) => {
    const text = raw.trim();
    if (!text || sending) return;

    // build history BEFORE adding the new message; the backend appends it itself
    const history = messages
      .filter((m) => !m.error && m.text)
      .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));

    setMessages((m) => [...m, { id: uid(), role: "user", text }]);
    setInput("");
    setSending(true);
    setStatus("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const reply = await chat(projectId, text, history, {
        signal: controller.signal,
        onEvent: (type, data) => {
          if (type === "tool_start") setStatus(statusFor(data.tool));
          else if (FILE_EVENTS.has(type)) onFileEvent?.(type, data);
        },
      });
      setMessages((m) => [...m, { id: uid(), role: "ai", text: reply || "Done." }]);
    } catch (err) {
      if (err.name !== "AbortError") {
        setMessages((m) => [
          ...m,
          { id: uid(), role: "ai", text: err.message || "Something went wrong. Please try again.", error: true },
        ]);
      }
    } finally {
      setSending(false);
      setStatus("");
      abortRef.current = null;
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-11 shrink-0 items-center justify-between px-4">
        <span className="text-sm font-semibold">Kiln AI Chat</span>
        <div className="flex gap-1">
          {messages.length > 0 && (
            <button type="button" onClick={clearChat} aria-label="Clear chat" title="Clear chat" className={`rounded-lg p-1.5 ${t.icon}`}>
              <TrashIcon size={16} />
            </button>
          )}
          {onClose && (
            <button type="button" onClick={onClose} aria-label="Close chat" className={`rounded-lg p-1.5 md:hidden ${t.icon}`}>
              <XIcon size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className={`flex h-14 w-14 items-center justify-center rounded-2xl text-[#2BB5A6] ${t.soft}`}>
              <SparkIcon size={26} />
            </span>
            <h3 className="mt-5 text-base font-semibold">What do you want to build?</h3>
            <p className={`mt-1.5 text-sm ${t.muted}`}>Ask me to create or modify files.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => { setInput(s); areaRef.current?.focus(); }} className={`rounded-full border px-3 py-1.5 text-xs transition ${t.border} ${t.idle}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3 pb-2">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] whitespace-pre-wrap wrap-break-word rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === "user" ? `${t.user} rounded-br-md` : `${m.error ? "text-red-500 " : ""}${t.ai} rounded-bl-md`
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className={`flex items-center gap-2 rounded-2xl rounded-bl-md px-4 py-3 ${t.ai}`} aria-label="AI is working">
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-60" style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </span>
                  {status && <span className="text-xs opacity-70">{status}</span>}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <div className={`shrink-0 border-t p-3 ${t.border}`}>
        <div className={`flex items-end gap-2 rounded-xl border p-2 focus-within:border-[#2BB5A6] ${t.input}`}>
          <textarea
            ref={areaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask AI to build something…"
            aria-label="Message"
            className="min-w-0 flex-1 resize-none bg-transparent px-1.5 py-1 text-sm outline-none"
          />
          <button
            type="button"
            onClick={() => send(input)}
            disabled={!input.trim() || sending}
            aria-label="Send message"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2BB5A6] text-[#06201D] transition hover:bg-[#35c9b9] disabled:opacity-40"
          >
            <SendIcon size={16} />
          </button>
        </div>
        <p className={`mt-2 text-[11px] ${t.muted}`}>Enter to send · Shift + Enter for new line</p>
      </div>
    </div>
  );
}