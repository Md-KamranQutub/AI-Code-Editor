import { useT } from "../utils/theme.js";
import CodeEditor from "./CodeEditor";
import { langFromName, fileColor } from "../utils/fileTree.js";
import { CircleIcon, CodeIcon, EyeIcon, FileIcon, XIcon } from "./icons";

function EmptyState({ icon, title, hint }) {
  const t = useT();
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <span className={`flex h-16 w-16 items-center justify-center rounded-2xl ${t.soft} ${t.muted}`}>{icon}</span>
      <h3 className="mt-5 text-base font-semibold">{title}</h3>
      <p className={`mt-1.5 max-w-xs text-sm ${t.muted}`}>{hint}</p>
    </div>
  );
}

export default function EditorPanel({
  files, activeId, dirty, view, previewHtml,
  onSelect, onClose, onChange, onSave, onViewChange,
}) {
  const t = useT();
  const active = files.find((f) => f._id === activeId);

  const viewBtn = (id, label, Ico) => (
    <button
      type="button"
      onClick={() => onViewChange(id)}
      aria-pressed={view === id}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2BB5A6] ${
        view === id ? `${t.active} shadow-sm` : t.idle
      }`}
    >
      <Ico size={15} /> <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <section className={`flex min-h-0 min-w-0 flex-1 flex-col ${t.main}`}>
      <div className={`flex h-11 shrink-0 items-center justify-between gap-2 border-b pr-2 ${t.bar}`}>
        <div role="tablist" className="flex h-full min-w-0 flex-1 overflow-x-auto">
          {files.map((f) => {
            const on = f._id === activeId;
            return (
              <div
                key={f._id}
                role="tab"
                aria-selected={on}
                onClick={() => onSelect(f._id)}
                className={`group flex h-full shrink-0 cursor-pointer items-center gap-2 border-r border-b-2 px-3 text-sm ${t.border} ${
                  on ? "border-b-[#2BB5A6] " + t.active : "border-b-transparent " + t.idle
                }`}
              >
                <FileIcon size={14} className={fileColor(f.name)} />
                <span className="max-w-35 truncate">{f.name}</span>
                <button
                  type="button"
                  aria-label={`Close ${f.name}`}
                  onClick={(e) => { e.stopPropagation(); onClose(f._id); }}
                  className={`cursor-pointer rounded p-0.5 ${t.icon}`}
                >
                  {dirty.has(f._id) ? (
                    <>
                      <span className="block h-2 w-2 rounded-full bg-[#FF9F43] group-hover:hidden" />
                      <XIcon size={12} className="hidden group-hover:block" />
                    </>
                  ) : (
                    <XIcon size={12} />
                  )}
                </button>
              </div>
            );
          })}
        </div>
        <div className={`flex shrink-0 gap-0.5 rounded-xl p-0.5 ${t.soft}`}>
          {viewBtn("editor", "Editor", CodeIcon)}
          {viewBtn("preview", "Preview", EyeIcon)}
        </div>
      </div>

      {view === "preview" ? (
        previewHtml ? (
          <iframe title="Preview" srcDoc={previewHtml} sandbox="allow-scripts allow-modals" className="min-h-0 w-full flex-1 bg-white" />
        ) : (
          <EmptyState icon={<EyeIcon size={26} />} title="Nothing to preview" hint="Add an index.html file to see a live preview here." />
        )
      ) : active ? (
        <>
          <CodeEditor key={active._id} fileId={active._id} fileName={active.name} value={active.content} onChange={(v) => onChange(active._id, v)} onSave={() => onSave(active._id)} />
          <div className={`flex h-7 shrink-0 items-center justify-between border-t px-3 text-xs ${t.bar} ${t.muted}`}>
            <span>{langFromName(active.name)}</span>
            <span>{dirty.has(active._id) ? "Unsaved changes · Ctrl+S to save" : "Saved"}</span>
          </div>
        </>
      ) : (
        <EmptyState icon={<CircleIcon size={26} />} title="No file open" hint="Select a file from Explorer to start editing." />
      )}
    </section>
  );
}
