import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { useT } from "../utils/theme.js";
import { AlertIcon, OutputIcon, SquareTerminalIcon, TrashIcon, XIcon } from "./icons";

/* Props:
 *  - projectId, userId : sent to the backend on "terminal:init"
 *  - socketUrl         : terminal service URL (default http://localhost:8005)
 *  - output: string[]  lines for the Output tab
 *  - problems: [{ file, line, message }]
 *  - onClose()
 *
 * Protocol (matches the backend):
 *  emit  terminal:init   { projectId, userId, cols, rows }
 *  emit  terminal:write  string
 *  emit  terminal:resize { cols, rows }
 *  on    terminal:ready  { cols, rows }
 *  on    terminal:data   string
 */
export default function TerminalPanel({
  projectId,
  userId,
  socketUrl = import.meta.env?.VITE_TERMINAL_URL || "http://localhost:8000",
  output = [],
  problems = [],
  onClose,
}) {
  const t = useT();
  const [tab, setTab] = useState("terminal");
  const [status, setStatus] = useState("connecting"); // connecting | ready | disconnected
  const [shell, setShell] = useState("shell");

  const hostRef = useRef(null);
  const termRef = useRef(null);
  const fitRef = useRef(null);
  const socketRef = useRef(null);

  // Create xterm once.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      lineHeight: 1.4,
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
      allowTransparency: true,
      scrollback: 5000,
      theme: {
        background: "rgba(0,0,0,0)",
        foreground: getComputedStyle(host).color,
        cursor: "#2BB5A6",
        selectionBackground: "rgba(43,181,166,0.35)",
      },
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(host);
    termRef.current = term;
    fitRef.current = fit;

    return () => {
      term.dispose();
      termRef.current = null;
      fitRef.current = null;
    };
  }, []);

  // Connect socket and wire it to xterm.
  useEffect(() => {
    const term = termRef.current;
    const fit = fitRef.current;
    if (!term || !fit || !projectId || !userId) return;

    const socket = io(socketUrl, { withCredentials: true });
    socketRef.current = socket;

    const safeFit = () => {
      try {
        fit.fit();
      } catch {
        /* host is hidden or has zero size */
      }
    };

    const init = () => {
      safeFit();
      term.reset();
      setStatus("connecting");
      socket.emit("terminal:init", {
        projectId,
        userId,
        cols: term.cols,
        rows: term.rows,
      });
    };

    socket.on("connect", init);
    socket.on("terminal:ready", () => {
      setStatus("ready");
      setShell("bash");
      term.focus();
    });
    socket.on("terminal:data", (data) => term.write(data));
    socket.on("disconnect", () => {
      setStatus("disconnected");
      term.write("\r\n\x1b[90m[disconnected from terminal service]\x1b[0m\r\n");
    });
    socket.on("connect_error", (err) => {
      setStatus("disconnected");
      term.write(`\r\n\x1b[31m[connection error: ${err.message}]\x1b[0m\r\n`);
    });

    const dataSub = term.onData((data) => socket.emit("terminal:write", data));
    const resizeSub = term.onResize(({ cols, rows }) =>
      socket.emit("terminal:resize", { cols, rows })
    );

    const observer = new ResizeObserver(() => safeFit());
    observer.observe(hostRef.current);

    return () => {
      observer.disconnect();
      dataSub.dispose();
      resizeSub.dispose();
      socket.off();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [projectId, userId, socketUrl]);

  // Re-fit and focus when returning to the terminal tab (it stays mounted while hidden).
  useEffect(() => {
    if (tab !== "terminal") return;
    const id = requestAnimationFrame(() => {
      try {
        fitRef.current?.fit();
      } catch {
        /* ignore */
      }
      termRef.current?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [tab]);

  const clearTerminal = () => {
    termRef.current?.clear();
    termRef.current?.focus();
  };

  const tabs = [
    ["terminal", "Terminal", SquareTerminalIcon, 0],
    ["output", "Output", OutputIcon, 0],
    ["problems", "Problems", AlertIcon, problems.length],
  ];

  const dot =
    status === "ready" ? "bg-emerald-500" : status === "connecting" ? "bg-[#FF9F43]" : "bg-slate-500";
  const statusText =
    status === "ready" ? "connected" : status === "connecting" ? "connecting…" : "disconnected";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-11 shrink-0 items-center justify-between px-2">
        <div role="tablist" className="flex gap-1 overflow-x-auto">
          {tabs.map(([id, label, Ico, count]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2BB5A6] ${
                tab === id ? t.active : t.idle
              }`}
            >
              <Ico size={14} /> {label}
              {count > 0 && (
                <span className="rounded-full bg-[#FF9F43] px-1.5 text-[10px] text-[#06201D]">{count}</span>
              )}
            </button>
          ))}
        </div>
        <button type="button" onClick={onClose} aria-label="Close terminal panel" className={`rounded-lg p-1.5 ${t.icon}`}>
          <XIcon size={16} />
        </button>
      </div>

      {/* Terminal tab: kept mounted (hidden) so the shell session survives tab switches */}
      <div className={tab === "terminal" ? "flex min-h-0 flex-1 flex-col" : "hidden"}>
        <div className={`flex h-8 shrink-0 items-center justify-between px-4 text-xs ${t.muted}`}>
          <span className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${dot}`} />
            {shell} — {statusText}
          </span>
          <button type="button" onClick={clearTerminal} aria-label="Clear terminal" title="Clear" className={`rounded p-1 ${t.icon}`}>
            <TrashIcon size={14} />
          </button>
        </div>
        <div ref={hostRef} className="min-h-0 flex-1 overflow-hidden px-4 pb-3" />
      </div>

      {tab === "output" && (
        <div className="min-h-0 flex-1 overflow-auto px-4 py-2 font-mono text-[13px] leading-6">
          {output.length ? (
            output.map((o, i) => (
              <div key={i} className="whitespace-pre-wrap">{o}</div>
            ))
          ) : (
            <p className={t.muted}>No output yet.</p>
          )}
        </div>
      )}

      {tab === "problems" && (
        <div className="min-h-0 flex-1 overflow-auto px-4 py-2 text-sm">
          {problems.length ? (
            problems.map((p, i) => (
              <div key={i} className="flex items-start gap-2 py-1">
                <AlertIcon size={16} className="mt-0.5 shrink-0 text-[#FF9F43]" />
                <span>
                  {p.message}{" "}
                  <span className={t.muted}>
                    {p.file}
                    {p.line ? `:${p.line}` : ""}
                  </span>
                </span>
              </div>
            ))
          ) : (
            <p className={t.muted}>No problems detected in the workspace.</p>
          )}
        </div>
      )}
    </div>
  );
}