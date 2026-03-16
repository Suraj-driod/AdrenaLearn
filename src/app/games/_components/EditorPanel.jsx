"use client";

import { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";

export default function EditorPanel({
  title = "Code Editor",
  getQuestion = () => window.currentAmongQuestion,
  checkCode,
}) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [value, setValue] = useState(
    "# Write your Python code here\n\ndef solution():\n    pass\n"
  );

  const dispatchClosed = () => window.dispatchEvent(new Event("editorClosed"));

  const openHandler = useMemo(
    () => () => {
      const q = getQuestion?.();
      setQuestion(typeof q === "string" ? q : "");
      setValue("# Write your Python code here\n\ndef solution():\n    pass\n");
      setOpen(true);
    },
    [getQuestion]
  );

  useEffect(() => {
    window.addEventListener("openEditor", openHandler);
    return () => window.removeEventListener("openEditor", openHandler);
  }, [openHandler]);

  const closeAsWrong = () => {
    setOpen(false);
    dispatchClosed();
    window.dispatchEvent(new Event("wrongAnswer"));
  };

  const submit = async () => {
    const code = value;

    if (!code || typeof code !== "string" || code.trim() === "") {
      setOpen(false);
      dispatchClosed();
      window.dispatchEvent(new Event("wrongAnswer"));
      return;
    }

    setOpen(false);
    dispatchClosed();

    const ok = await checkCode(code);
    window.dispatchEvent(new Event(ok ? "correctAnswer" : "wrongAnswer"));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="font-[Outfit] font-black tracking-wide text-white/90">
          {title}
        </div>
        <button
          onClick={closeAsWrong}
          className={[
            "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
            open
              ? "border-red-500/40 text-red-200 hover:bg-red-500/10"
              : "border-white/10 text-white/40 cursor-not-allowed",
          ].join(" ")}
          disabled={!open}
        >
          Close
        </button>
      </div>

      {!open ? (
        <div className="flex-1 p-4 text-sm text-white/50">
          Trigger a challenge in-game to open the editor.
        </div>
      ) : (
        <>
          <div className="px-4 py-3 border-b border-white/10 bg-white/5">
            <div className="text-[11px] font-bold tracking-widest text-white/50 uppercase">
              Question
            </div>
            <div className="mt-1 text-sm font-semibold text-[#fbc13a] whitespace-pre-wrap">
              {question || "Write your solution below."}
            </div>
          </div>

          <div
            className="flex-1"
            onKeyDown={(e) => e.stopPropagation()}
            onKeyUp={(e) => e.stopPropagation()}
          >
            <Editor
              height="100%"
              defaultLanguage="python"
              value={value}
              onChange={(v) => setValue(v ?? "")}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 12, bottom: 12 },
                lineNumbers: "on",
                roundedSelection: true,
                automaticLayout: true,
                tabSize: 4,
              }}
            />
          </div>

          <div className="px-4 py-3 border-t border-white/10 flex items-center justify-end gap-2">
            <button
              onClick={closeAsWrong}
              className="px-3 py-2 rounded-xl text-sm font-bold border border-white/10 text-white/70 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              className="px-4 py-2 rounded-xl text-sm font-black bg-gradient-to-r from-[#00cc44] to-[#008833] text-white shadow-[0_8px_30px_rgba(0,204,68,0.18)]"
            >
              Submit
            </button>
          </div>
        </>
      )}
    </div>
  );
}

