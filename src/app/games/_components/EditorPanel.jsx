"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Loader2 } from "lucide-react";

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
  const [hasWrongAnswer, setHasWrongAnswer] = useState(false);
  const [hint, setHint] = useState("");
  const [isHintPopupOpen, setIsHintPopupOpen] = useState(false);
  const [isGeneratingHint, setIsGeneratingHint] = useState(false);

  const dispatchClosed = () => window.dispatchEvent(new Event("editorClosed"));

  const openHandler = useCallback(() => {
    const q = getQuestion?.();
    const qStr = typeof q === "string" ? q : "";
    setQuestion((prev) => {
      if (prev !== qStr) {
        setHasWrongAnswer(false);
        setHint("");
      }
      return qStr;
    });
    setValue("# Write your Python code here\n\ndef solution():\n    pass\n");
    setOpen(true);
  }, [getQuestion]);

  useEffect(() => {
    window.addEventListener("openEditor", openHandler);
    return () => window.removeEventListener("openEditor", openHandler);
  }, [openHandler]);

  const closeAsWrong = () => {
    setHasWrongAnswer(true);
    setOpen(false);
    dispatchClosed();
    window.dispatchEvent(new Event("wrongAnswer"));
  };

  const generateHint = async () => {
    setIsGeneratingHint(true);
    try {
      const res = await fetch("/api/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, code: value }),
      });
      const data = await res.json();
      setHint(data.hint || "Couldn't generate hint.");
    } catch (err) {
      setHint("Failed to load hint. Try again.");
    } finally {
      setIsGeneratingHint(false);
    }
  };

  const submit = async () => {
    const code = value;

    if (!code || typeof code !== "string" || code.trim() === "") {
      setHasWrongAnswer(true);
      setOpen(false);
      dispatchClosed();
      window.dispatchEvent(new Event("wrongAnswer"));
      return;
    }

    setOpen(false);
    dispatchClosed();

    const ok = await checkCode(code);
    if (!ok) setHasWrongAnswer(true);
    window.dispatchEvent(new Event(ok ? "correctAnswer" : "wrongAnswer"));
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="font-[Outfit] font-black tracking-wide text-white/90 flex items-center gap-2">
          {hasWrongAnswer && (
            <button
              onClick={() => setIsHintPopupOpen(true)}
              className="text-lg hover:scale-110 transition-transform flex items-center justify-center cursor-pointer"
              title="Get a hint"
              type="button"
            >
              💡
            </button>
          )}
          <span>{title}</span>
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

      {/* Hint Popup Overlay */}
      {isHintPopupOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-center">
          <div className="bg-[#1e1b26] border-2 border-[#eae5d9] rounded-xl p-6 max-w-sm w-full shadow-[8px_8px_0px_#f04e7c] relative">
            <button
              onClick={() => setIsHintPopupOpen(false)}
              className="absolute top-2 right-4 text-white hover:text-[#f04e7c] text-xl font-bold"
            >
              ✕
            </button>
            <h3 className="text-[#fbc13a] font-black text-xl mb-4 flex items-center justify-center gap-2 font-[Outfit]">
              💡 Here's a Hint
            </h3>
            <div className="text-white/90 text-sm whitespace-pre-wrap font-medium min-h-[60px] flex items-center justify-center">
              {isGeneratingHint ? (
                <div className="flex items-center justify-center gap-2 text-white/50">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Requesting Kode Sensei...
                </div>
              ) : hint ? (
                <span className="text-left leading-relaxed">{hint}</span>
              ) : (
                <button
                  onClick={generateHint}
                  className="px-4 py-2 bg-[#f04e7c] text-white rounded-lg font-black border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#1e1b26] transition-all"
                >
                  Reveal Hint
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

