import { useEffect, useRef, useState } from "react";

const PALETTE = {
  light: {
    overlay: "bg-slate-900/40",
    panel: "border-slate-200 bg-white text-slate-900 shadow-2xl shadow-slate-900/20",
    muted: "text-slate-500",
    input:
      "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 hover:border-slate-400",
    ghost: "border-slate-300 text-slate-700 hover:bg-slate-100",
    close: "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
  },
  dark: {
    overlay: "bg-black/60",
    panel: "border-white/10 bg-[#0D1B1D] text-white shadow-2xl shadow-black/50",
    muted: "text-slate-400",
    input:
      "border-white/15 bg-white/5 text-white placeholder:text-slate-500 hover:border-white/25",
    ghost: "border-white/15 text-slate-200 hover:bg-white/10",
    close: "text-slate-400 hover:bg-white/10 hover:text-white",
  },
};

const PRIMARY_BTN =
  " cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-[#2BB5A6] px-5 py-2.5 text-sm font-semibold text-[#06201D] transition hover:bg-[#35c9b9] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2BB5A6]/40 active:translate-y-px disabled:cursor-progress disabled:opacity-70";

const FIELD =
  "w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:border-[#2BB5A6] focus:ring-4 focus:ring-[#2BB5A6]/20";

/**
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - onCreate: ({ name, description }) => void | Promise  (throw/reject to show an error)
 *  - mode: "light" | "dark"
 */
export default function CreateProjectModal({ open, onClose, onCreate }) {
  const mode = localStorage.getItem("kiln-theme");
  const p = PALETTE[mode];
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef(null);
  const busy = useRef(false);

  // reset + focus when opened, Esc to close, lock page scroll
  useEffect(() => {
    if (!open) return;
    setName("");
    setDescription("");
    setError("");
    setSubmitting(false);
    busy.current = false;
    nameRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape" && !busy.current) onClose?.();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please give your project a name.");
      nameRef.current?.focus();
      return;
    }
    setError("");
    setSubmitting(true);
    busy.current = true;
    try {
      await onCreate?.(name, description);
      onClose?.();
    } catch {
      setError("Couldn’t create the project. Please try again.");
      setSubmitting(false);
      busy.current = false;
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 backdrop-blur-sm ${p.overlay}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy.current) onClose?.();
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-project-title"
        onSubmit={handleSubmit}
        noValidate
        className={`relative w-full max-w-md rounded-2xl border p-6 sm:p-8 ${p.panel}`}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          aria-label="Close"
          className={`cursor-pointer absolute right-4 top-4 rounded-lg p-1.5 transition ${p.close}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <h2 id="create-project-title" className="text-xl font-bold tracking-tight">
          Create New Project
        </h2>
        <p className={`mt-1 text-sm ${p.muted}`}>Give your project a name to get started.</p>

        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="project-name" className="mb-2 block text-sm font-semibold">
              Name of the Project
            </label>
            <input
              id="project-name"
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              placeholder="e.g. Portfolio website"
              autoComplete="off"
              aria-invalid={!!error}
              aria-describedby={error ? "project-error" : undefined}
              className={`${FIELD} ${p.input}`}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="project-desc" className="text-sm font-semibold">
                Description <span className={`font-normal ${p.muted}`}>(optional)</span>
              </label>
              <span className={`text-xs ${p.muted}`}>{description.length}/200</span>
            </div>
            <textarea
              id="project-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="What are you building?"
              className={`${FIELD} resize-none ${p.input}`}
            />
          </div>
        </div>

        {error && (
          <p id="project-error" role="alert" className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {error}
          </p>
        )}

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className={`cursor-pointer rounded-xl border px-5 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2BB5A6]/40 ${p.ghost}`}
          >
            Cancel
          </button>
          <button type="submit" disabled={submitting} className={PRIMARY_BTN}>
            {submitting && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#06201D]/30 border-t-[#06201D]" />
            )}
            {submitting ? "Creating…" : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
}
