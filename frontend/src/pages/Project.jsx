import { useEffect, useMemo, useState } from "react";
import { THEMES, ThemeCtx, useTheme } from "../utils/theme.js";
import {
  flattenFiles, contentMap, updateContent, addChild, removeNode,
  collectFileIds, buildPreview, createTree,
} from "../utils/fileTree.js";
import ProjectHeader from "../components/ProjectHeader.jsx";
import ActivityBar from "../components/ActivityBar.jsx";
import FileExplorer from "../components/FileExplorer.jsx";
import EditorPanel from "../components/EditorPanel.jsx";
import TerminalPanel from "../components/TerminalPanel.jsx";
import ChatPanel from "../components/ChatPanel.jsx";
import Resizer from "../components/Resizer.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { createRootFolder, deleteFile, getNodes, updateFileContent } from "../features/file.js";
import Loading from "../components/Loading.jsx";

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export default function ProjectPage() {
  const [mode, toggleTheme] = useTheme();
  const t = THEMES[mode];

  const { projectId } = useParams();
  const user = useSelector((state) => state.user).userData;
  const {currentProject} = useSelector((state) => state.project);
  const navigate = useNavigate();

  // `tree` is a single ROOT node (or null while loading) – not an array
  const [tree, setTree] = useState(null);
  const [saved, setSaved] = useState({});
  const [openIds, setOpenIds] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [view, setView] = useState("editor");

  const [explorerOpen, setExplorerOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [explorerW, setExplorerW] = useState(260);
  const [chatW, setChatW] = useState(340);
  const [termH, setTermH] = useState(240);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const files = useMemo(() => flattenFiles(tree), [tree]);
  const byId = useMemo(() => new Map(files.map((f) => [String(f._id), f])), [files]);
  const openFiles = openIds.map((id) => byId.get(String(id))).filter(Boolean);
  const dirty = new Set(
    openFiles.filter((f) => (f.content ?? "") !== (saved[f._id] ?? "")).map((f) => f._id)
  );
  const previewHtml = useMemo(() => (view === "preview" ? buildPreview(tree) : null), [tree, view]);


  const loadTree = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await getNodes(projectId);
      const nodes = [...(res.data ?? [])];

      if (nodes.length === 0) {
        const created = await createRootFolder(projectId, currentProject?.name);
        nodes.push(created?.data ?? created);
      }

      const root = createTree(nodes);
      setTree(root);
      setSaved(contentMap(root));
    } catch (err) {
      console.error(err);
      setLoadError(err?.message || "Failed to load project.");
    } finally {
      setLoading(false); // runs AFTER the async work, not immediately
    }
  };

  useEffect(() => {
    loadTree();
  }, [projectId]);

  const openFile = (node) => {
    setOpenIds((ids) => (ids.includes(node._id) ? ids : [...ids, node._id]));
    setActiveId(node._id);
    setView("editor");
  };

  const closeTab = (id) => {
    const f = byId.get(String(id));
    if (f && (f.content ?? "") !== (saved[id] ?? "") && !window.confirm(`Discard unsaved changes to ${f.name}?`)) return;
    const i = openIds.indexOf(id);
    const next = openIds.filter((x) => x !== id);
    setOpenIds(next);
    if (activeId === id) setActiveId(next[Math.min(i, next.length - 1)] ?? null);
  };

  const saveFile = async(id) => {
    const f = byId.get(String(id));
    if (!f) return;
    console.log(f.content);
    setSaved((s) => ({ ...s, [id]: f.content}));
    // TODO: persist to backend here, e.g. await saveFileContent(id, content)
    await updateFileContent(id, f.content ?? "");
  };

  // called by FileExplorer with the node the backend just created
  const createNode = (parentId, node) => {
    setTree((tr) => addChild(tr, parentId, node));
    if (node.type === "file") {
      setSaved((s) => ({ ...s, [node._id]: node.content ?? "" }));
      openFile(node);
    }
  };

  const deleteNode = async (node) => {
    if (!node) return;
    try {
      const result = window.confirm(`Are you sure you want to delete ${node.name}? This cannot be undone.`);
      if (!result) return;
      await deleteFile(node._id); // backend first
      const gone = collectFileIds(node);
      const next = openIds.filter((id) => !gone.includes(id));
      setTree((tr) => removeNode(tr, node._id));
      setOpenIds(next);
      if (gone.includes(activeId)) setActiveId(next[next.length - 1] ?? null);
    } catch (err) {
      console.error(err);
    }
  };

  const onFileEvent = (type, data)=>{
    console.log(type, data);
    if(type ==="create_file"){
    setTree((tr)=>addChild(tr, data.file.parent, data.file));
    }
    else if(type === "create_folder"){
      setTree((tr)=>addChild(tr, data.folder.parent, data.folder));
    }
    else if(type === "file_updated"){
      console.log(type , data);
      setTree((tr)=>updateContent(tr,data.file._id,data.file.content));
    }
    else if(type === "file_deleted"){
      setTree((tr)=>removeNode(tr,data.file._id));
    }

  }


  const onBack = () => navigate("/");

  if (loading) return <Loading/>;
  if (!tree) return <div>{loadError || "Project not found."}</div>;

  return (
    <ThemeCtx.Provider value={t}>
      <div className={`flex h-screen flex-col transition-colors duration-300 ${t.page}`}>
        <ProjectHeader
          projectName={currentProject?.name}
          user={user}
          mode={mode}
          onToggleTheme={toggleTheme}
          onBack={onBack}
          terminalOpen={terminalOpen}
          onToggleTerminal={() => setTerminalOpen((o) => !o)}
          chatOpen={chatOpen}
          onToggleChat={() => setChatOpen((o) => !o)}
        />

        <div className="relative flex min-h-0 flex-1">
          <ActivityBar
            explorerOpen={explorerOpen}
            chatOpen={chatOpen}
            terminalOpen={terminalOpen}
            onExplorer={() => setExplorerOpen((o) => !o)}
            onChat={() => setChatOpen((o) => !o)}
            onTerminal={() => setTerminalOpen((o) => !o)}
          />

          {explorerOpen && (
            <>
              <aside
                style={{ "--w": `${explorerW}px` }}
                className={`absolute inset-y-0 left-14 z-20 w-[calc(100%-3.5rem)] border-r md:static md:z-auto md:w-[var(--w)] md:shrink-0 ${t.side}`}
              >
                <FileExplorer
                  tree={tree}
                  activeId={activeId}
                  onOpenFile={openFile}
                  onCreate={createNode}
                  onDelete={deleteNode}
                  onRefresh={loadTree}
                />
              </aside>
              <Resizer direction="x" className="hidden md:block" onDrag={(dx) => setExplorerW((w) => clamp(w + dx, 180, 480))} />
            </>
          )}

          <div className="flex min-w-0 flex-1 flex-col">
            <EditorPanel
              files={openFiles}
              activeId={activeId}
              dirty={dirty}
              view={view}
              previewHtml={previewHtml}
              onSelect={setActiveId}
              onClose={closeTab}
              onChange={ (id, content) => { setTree((tr) => updateContent(tr, id, content))}}
              onSave={saveFile}
              onViewChange={setView}
            />
            {terminalOpen && (
              <>
                <Resizer direction="y" onDrag={(dy) => setTermH((h) => clamp(h - dy, 120, 520))} />
                <div style={{ height: termH }} className={`shrink-0 border-t ${t.term}`}>
                  <TerminalPanel
                    Name={tree.name}
                    projectId={projectId}
                    userId={user._id}
                    fileNames={files.map((f) => f.path)}
                    onClose={() => setTerminalOpen(false)}
                  />
                </div>
              </>
            )}
          </div>

          {chatOpen && (
            <>
              <Resizer direction="x" className="hidden md:block" onDrag={(dx) => setChatW((w) => clamp(w - dx, 260, 560))} />
              <aside
                style={{ "--w": `${chatW}px` }}
                className={`absolute inset-y-0 right-0 z-20 w-full max-w-sm border-l md:static md:z-auto md:w-[var(--w)] md:max-w-none md:shrink-0 ${t.side}`}
              >
                <ChatPanel projectId={projectId} onFileEvent={onFileEvent} onClose={() => setChatOpen(false)} />
              </aside>
            </>
          )}
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}