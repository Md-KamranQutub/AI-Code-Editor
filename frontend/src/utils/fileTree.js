/* Helpers for the in-memory file tree.
   The tree is ONE root node (not an array):
   { _id, name, type: "file" | "folder", content?, children? } */

let counter = 1;
export const newId = () => `n${Date.now().toString(36)}${counter++}`;

// ids can be strings or ObjectId-like values, so always compare as strings
const same = (a, b) => a != null && b != null && String(a) === String(b);

export function sampleTree(name = "project") {
  return {
    _id: "root",
    name,
    type: "folder",
    children: [
      {
        _id: "f-index",
        name: "index.html",
        type: "file",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>My Project</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <main>
    <h1>Hello from Kiln</h1>
    <button id="btn">Clicked 0 times</button>
  </main>
  <script src="script.js"></script>
</body>
</html>
`,
      },
      {
        _id: "f-style",
        name: "style.css",
        type: "file",
        content: `body {
  font-family: system-ui, sans-serif;
  display: grid;
  place-items: center;
  min-height: 100vh;
  margin: 0;
  background: #0e1f22;
  color: #fff;
}
button {
  padding: 10px 18px;
  border: 0;
  border-radius: 10px;
  background: #2bb5a6;
  font-weight: 600;
  cursor: pointer;
}
`,
      },
      {
        _id: "f-script",
        name: "script.js",
        type: "file",
        content: `let count = 0;
const btn = document.getElementById("btn");

btn.addEventListener("click", () => {
  count += 1;
  btn.textContent = "Clicked " + count + " times";
});
`,
      },
    ],
  };
}

// folders first, then alphabetical. Returns a NEW sorted array.
export const sortNodes = (children) =>
  [...(children || [])].sort((a, b) =>
    a.type === b.type
      ? (a.name || "").localeCompare(b.name || "")
      : a.type === "folder"
      ? -1
      : 1
  );

export function findNode(node, id) {
  if (!node) return null;
  if (same(node._id, id)) return node;
  for (const c of node.children || []) {
    const r = findNode(c, id);
    if (r) return r;
  }
  return null;
}

// Builds a single root node from the flat list returned by the backend.
export const createTree = (nodes = []) => {
  const map = {};
  let root = null;

  nodes.forEach((node) => {
    map[String(node._id)] = { ...node, children: [] };
  });

  nodes.forEach((node) => {
    const id = String(node._id);
    const parent = node.parent != null ? String(node.parent) : null;
    if (parent && map[parent]) {
      map[parent].children.push(map[id]);
    } else if (!parent) {
      root = map[id];
    }
  });

  return root;
};

// Immutable: returns a new tree with fn applied to the node matching id.
const mapNode = (node, id, fn) => {
  if (!node) return node;
  if (same(node._id, id)) return fn(node);
  if (!node.children) return node;
  return { ...node, children: node.children.map((c) => mapNode(c, id, fn)) };
};

export const updateContent = (tree, id, content) =>
  mapNode(tree, id, (n) => ({ ...n, content }));

// Immutable: returns the new tree (the old version returned undefined and mutated state).
export const addChild = (tree, parentId, child) =>
  mapNode(tree, parentId, (n) => ({ ...n, children: [...(n.children || []), child] }));

// Immutable: returns the whole tree without the node (the old version returned only an array of children).
export const removeNode = (node, id) => {
  if (!node) return node;
  return {
    ...node,
    children: (node.children || [])
      .filter((c) => !same(c._id, id))
      .map((c) => (c.type === "folder" ? removeNode(c, id) : c)),
  };
};

// ids of every file in (or under) the node
export const collectFileIds = (node) =>
  !node
    ? []
    : node.type === "file"
    ? [node._id]
    : (node.children || []).flatMap(collectFileIds);

// Takes the ROOT node (not an array). Paths exclude the root's own name.
export function flattenFiles(node, base = "") {
  if (!node) return [];
  return (node.children || []).flatMap((c) =>
    c.type === "file"
      ? [{ ...c, path: base + c.name }]
      : flattenFiles(c, base + c.name + "/")
  );
}

export const contentMap = (tree) =>
  Object.fromEntries(flattenFiles(tree).map((f) => [f._id, f.content ?? ""]));

const LANGS = {
  html: "HTML", css: "CSS", js: "JavaScript", jsx: "JavaScript React", ts: "TypeScript",
  tsx: "TypeScript React", json: "JSON", md: "Markdown", py: "Python", java: "Java",
};
export const langFromName = (name = "") =>
  LANGS[name.split(".").pop().toLowerCase()] || "Plain Text";

export function fileColor(name) {
  switch (name?.split(".").pop().toLowerCase()) {
    case "html": return "text-orange-500";
    case "css": return "text-sky-500";
    case "js": case "jsx": return "text-yellow-500";
    case "ts": case "tsx": return "text-blue-500";
    case "json": return "text-emerald-500";
    case "java": return "text-blue-700";
    case "py": return "text-blue-400";
    case "md": return "text-slate-400";
    default: return "text-slate-400";
  }
}

/* Inlines style.css / script.js into index.html so the preview iframe works with no server. */
export function buildPreview(tree) {
  const files = flattenFiles(tree);
  const index = files.find((f) => f.name?.toLowerCase() === "index.html");
  if (!index) return null;
  const byName = new Map(files.map((f) => [f.name, f]));
  const base = (p) => p.split("/").pop();

  return (index.content ?? "")
    .replace(/<link[^>]*href=["']([^"']+)["'][^>]*>/gi, (m, href) => {
      const f = byName.get(base(href));
      return f && f.name.endsWith(".css") ? `<style>${f.content ?? ""}</style>` : m;
    })
    .replace(/<script[^>]*src=["']([^"']+)["'][^>]*>\s*<\/script>/gi, (m, src) => {
      const f = byName.get(base(src));
      return f ? `<script>${(f.content ?? "").replace(/<\/script/gi, "<\\/script")}</script>` : m;
    });
}

export function findLanguageFromFileName(fileName) {
  const ext = fileName?.split(".").pop().toLowerCase();
  switch (ext) {
    case "html": return "html";
    case "css": return "css";
    case "js": return "javascript";
    case "jsx": return "javascript";
    case "ts": return "typescript";
    case "tsx": return "typescript";
    case "json": return "json";
    case "md": return "markdown";
    case "py": return "python";
    case "java": return "java";
    default: return "";
  }
}

export function findLogoFromLanguage(language) {
  switch (language) {
    case "html": return "html5";
    case "css": return "css3-alt";
    case "javascript": return "js";
    case "typescript": return "ts";
    case "json": return "file-code";
    case "markdown": return "markdown";
    case "python": return "python";
    case "java": return "java";
    default: return "file";
  }
}