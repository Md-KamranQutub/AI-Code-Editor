import { useEffect, useState } from "react";
import { useT } from "../utils/theme.js";
import { findNode, sortNodes, fileColor } from "../utils/fileTree.js";
import {
  ChevronDown, ChevronRight, FileIcon, FilePlusIcon, FolderIcon,
  FolderOpenIcon, FolderPlusIcon, RefreshIcon, TrashIcon,
} from "./icons";
import { createFile, createFolder } from "../features/file.js";
import { useParams } from "react-router-dom";

function ActionBtn({ label, onClick, children }) {
  const t = useT();
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`rounded-md p-1 ${t.icon}`}
    >
      {children}
    </button>
  );
}

function NewEntry({ depth, type, error, onCommit, onCancel }) {
  const t = useT();
  const [value, setValue] = useState("");
  return (
    <div style={{ paddingLeft: 6 + depth * 14 + 18 }} className="py-1 pr-2">
      <div className="flex items-center gap-1.5">
        {type === "folder" ? <FolderIcon size={16} className="text-amber-500" /> : <FileIcon size={16} className={t.muted} />}
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onCommit(value);
            if (e.key === "Escape") onCancel();
          }}
          onBlur={onCancel}
          placeholder={type === "folder" ? "folder name" : "file name"}
          className={`min-w-0 flex-1 rounded-md border px-2 py-1 text-sm outline-none focus:border-[#2BB5A6] ${t.input} ${error ? "!border-red-500" : ""}`}
        />
      </div>
      {error && <p className="mt-1 pl-6 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function TreeNode({ node, depth, c }) {
  const { t, activeId, expanded, toggle, onOpen, startCreate, creating, commit, cancel, error, onDelete } = c;
  const isFolder = node.type === "folder";
  const id = String(node._id);
  const open = expanded.has(id);

  return (
    <div role="treeitem" aria-expanded={isFolder ? open : undefined}>
      <div
        style={{ paddingLeft: 6 + depth * 14 }}
        className={`group flex h-8 items-center rounded-lg pr-1.5 ${String(node._id) === String(activeId) ? t.active : t.idle}`}
      >
        <button
          type="button"
          onClick={() => (isFolder ? toggle(id) : onOpen(node))}
          className="flex cursor-pointer h-full min-w-0 flex-1 items-center gap-1.5 rounded-md text-left text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2BB5A6]"
        >
          {isFolder ? (open ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <span className="w-3.5 shrink-0" />}
          {isFolder ? (
            open ? <FolderOpenIcon size={16} className="shrink-0 text-amber-500" /> : <FolderIcon size={16} className="shrink-0 text-amber-500" />
          ) : (
            <FileIcon size={16} className={`shrink-0 ${fileColor(node.name)}`} />
          )}
          <span className="truncate">{node.name}</span>
        </button>
        <span className="flex shrink-0 gap-0.5 transition group-focus-within:opacity-100 md:opacity-0 md:group-hover:opacity-100">
          {isFolder && (
            <>
              <ActionBtn label="New file" onClick={() => startCreate(node, "file")}><FilePlusIcon size={15} /></ActionBtn>
              <ActionBtn label="New folder" onClick={() => startCreate(node, "folder")}><FolderPlusIcon size={15} /></ActionBtn>
            </>
          )}
          {depth > 0 && <ActionBtn label="Delete" onClick={() => onDelete(node)}><TrashIcon className="text-red-800 cursor-pointer" size={15} /></ActionBtn>}
        </span>
      </div>

      {isFolder && open && (
        <div role="group">
          {creating && String(creating.parent) === id && (
            <NewEntry depth={depth + 1} type={creating.type} error={error} onCommit={commit} onCancel={cancel} />
          )}
          {sortNodes(node.children).map((ch) => (
            <TreeNode key={ch._id} node={ch} depth={depth + 1} c={c} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileExplorer({ tree, activeId, onOpenFile, onCreate, onDelete, onRefresh }) {
  const t = useT();
  const { projectId } = useParams(); // useParams returns an object – destructure it
  const [expanded, setExpanded] = useState(() => new Set());
  const [creating, setCreating] = useState(null);
  const [error, setError] = useState("");
  const [spin, setSpin] = useState(false);

  // expand the root folder as soon as it exists
  useEffect(() => {
    if (tree?._id) setExpanded((s) => new Set(s).add(String(tree._id)));
  }, [tree?._id]);

  const toggle = (id) =>
    setExpanded((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const startCreate = (node, type) => {
    setExpanded((s) => new Set(s).add(String(node._id)));
    setCreating({ parent: node._id, type });
    setError("");
  };
  const cancel = () => { setCreating(null); setError(""); };

  const commit = async (raw) => {
    const name = raw.trim();
    if (!name || /[\\/]/.test(name)) return setError("Enter a valid name (no slashes).");
    const parent = findNode(tree, creating.parent);
    if (parent?.children?.some((ch) => ch.name.toLowerCase() === name.toLowerCase()))
      return setError(`“${name}” already exists here.`);

    try {
      const res =
        creating.type === "file"
          ? await createFile(projectId, creating.parent, name)
          : await createFolder(projectId, creating.parent, name);
      const created = res?.data ?? res;

      // normalise the node and hand it to the parent so it can update the tree
      const node = {
        type: creating.type,
        name,
        parent: creating.parent,
        ...created,
        ...(creating.type === "folder"
          ? { children: created?.children ?? [] }
          : { content: created?.content ?? "" }),
      };
      onCreate(creating.parent, node);
      setCreating(null);
      setError("");
    } catch (err) {
      setError(err?.message || "Could not create. Try again.");
    }
  };

  const refresh = async () => {
    setSpin(true);
    try {
      await onRefresh?.();
    } finally {
      setTimeout(() => setSpin(false), 700);
    }
  };

  const ctx = {
    t, activeId, expanded, toggle, onOpen: onOpenFile,
    startCreate, creating, commit, cancel, error, onDelete,
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-11 shrink-0 items-center justify-between px-4">
        <span className={`text-xs font-semibold uppercase tracking-wider ${t.muted}`}>Explorer</span>
        <button type="button" onClick={refresh} aria-label="Refresh explorer" title="Refresh" className={`rounded-lg p-1.5 ${t.icon}`}>
          <RefreshIcon size={16} className={spin ? "animate-spin" : ""} />
        </button>
      </div>
      <div role="tree" className="min-h-0 flex-1 overflow-y-auto px-2 pb-3 ">
        {tree && <TreeNode key={tree._id} node={tree} depth={0} c={ctx} />}
      </div>
    </div>
  );
}