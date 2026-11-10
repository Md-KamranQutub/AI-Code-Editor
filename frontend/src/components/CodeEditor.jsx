import { useRef, useEffect, useState } from "react";
import { useT } from "../utils/theme.js";
import Editor, {useMonaco} from "@monaco-editor/react";
import { findLanguageFromFileName } from "../utils/fileTree.js";

/* Lightweight, dependency-free editor: line numbers, Tab = 2 spaces, Ctrl/Cmd+S to save.
   Swap for @monaco-editor/react later if you want syntax highlighting. */
export default function CodeEditor({fileId, fileName, value, onChange, onSave }) {
  const t = useT();
  const gutterRef = useRef(null);
  const theme = localStorage.getItem("theme") ?? "dark";
  const editorTheme = theme === "dark" ? "clean-hc-black" : "light";
  const language = findLanguageFromFileName(fileName);

  const monaco = useMonaco();

  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme('clean-hc-black', {
        base: 'hc-black', // Inherit high-contrast properties
        inherit: true,
        rules: [],
        colors: {
          // Removes the border around the active cursor line
          'editor.lineHighlightBorder': '#00000000', 
          
          // Removes borders around text selections
          'editor.selectionHighlightBorder': '#00000000',
          'editor.findMatchBorder': '#00000000',
          'editor.findMatchHighlightBorder': '#00000000',

          // Optional: Removes the border around the entire editor container
          'editor.border': '#00000000',
          'editorWidget.border': '#00000000'
        },
      });
    }
  }, [monaco]);

  const handleBeforeMount = (monaco) => {
    // Defines/ensures the theme is set prior to editor initialization
    monaco.editor.setTheme(editorTheme ?? "clean-hc-black");
  };

  const onKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      onSave?.();
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.target;
      const { selectionStart: s, selectionEnd: end } = el;
      onChange(value.slice(0, s) + "  " + value.slice(end));
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s + 2; });
    }
  };

  return (
    <div className={`flex flex-col min-h-0 flex-1 font-mono text-[13px] leading-5 ${t.code}`}>
      <div className={`flex h-11 shrink-0 items-center gap-3 border-b px-3 ${t.bar}`}>
        <div className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 ${t.soft}`}>
        <span className="truncate text-sm font-medium">{fileName}</span>
        <span className="bg-blue-400 p-1 rounded-full"/>
        </div>
        <button onClick={()=>onSave(fileId)} className="rounded-lg p-1 inline bg-linear-to-b from-blue-400 to to-blue-600">Save</button>
      </div>
      {/* <div ref={gutterRef} aria-hidden="true" className={`select-none overflow-hidden border-r px-3 py-3 pb-8 text-right ${t.gutter}`}>
        {Array.from({ length: lines }, (_, i) => <div key={i}>{i + 1}</div>)}
      </div> */}
      {/* <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={(e) => { if (gutterRef.current) gutterRef.current.scrollTop = e.target.scrollTop; }}
        onKeyDown={onKeyDown}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        wrap="off"
        aria-label="Code editor"
        className="min-w-0 flex-1 resize-none overflow-auto whitespace-pre bg-transparent p-3 pb-8 outline-none"
      /> */}

      <Editor 
        onChange={(value) => onChange(value)}
        onScroll={(e) => { if (gutterRef.current) gutterRef.current.scrollTop = e.target.scrollTop; }}
        onKeyDown={onKeyDown}
        spellCheck={false}
        beforeMount={handleBeforeMount}
        options={{ automaticLayout: true, scrollBeyondLastLine: false}}
        autoCapitalize="off"
        autoCorrect="off"
        wrap="off"
        aria-label="Code editor"
        theme={editorTheme ?? "clean-hc-black"}
        language={language}
        value={value}
      />
    </div>
  );
}
