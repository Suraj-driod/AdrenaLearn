"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Loader2, Code2, FileText } from "lucide-react";

export default function EditorPanel({
  title = "Code Editor",
  getQuestion = () => window.currentAmongQuestion,
  checkCode,
  isCodeRelated,
}) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  
  // Determine if this challenge is code or conceptual text
  const isCode = useMemo(() => {
    if (typeof isCodeRelated === "boolean") return isCodeRelated;
    if (typeof window !== "undefined" && typeof window.__GAME_IS_CODE_RELATED__ === "boolean") {
      return window.__GAME_IS_CODE_RELATED__;
    }
    return true;
  }, [isCodeRelated, open]);

  const defaultInitialValue = useMemo(() => {
    return isCode
      ? "# Write your Python code here\n\ndef solution():\n    pass\n"
      : "";
  }, [isCode]);

  const [value, setValue] = useState(defaultInitialValue);
  const [hasWrongAnswer, setHasWrongAnswer] = useState(false);
  const [hint, setHint] = useState("");
  const [isHintPopupOpen, setIsHintPopupOpen] = useState(false);
  const [isGeneratingHint, setIsGeneratingHint] = useState(false);

  const dispatchClosed = () => window.dispatchEvent(new Event("editorClosed"));

  const openHandler = useCallback(() => {
    const q = getQuestion?.();
    const qStr = typeof q === "string" ? q : (q?.question || q?.instruction || "");
    setQuestion((prev) => {
      if (prev !== qStr) {
        setHasWrongAnswer(false);
        setHint("");
      }
      return qStr;
    });

    const isCodeActive = typeof isCodeRelated === "boolean" 
      ? isCodeRelated 
      : (typeof window !== "undefined" && typeof window.__GAME_IS_CODE_RELATED__ === "boolean" ? window.__GAME_IS_CODE_RELATED__ : true);

    setValue(isCodeActive ? "# Write your Python code here\n\ndef solution():\n    pass\n" : "");
    setOpen(true);
  }, [getQuestion, isCodeRelated]);

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

  const dynamicTitle = title !== "Code Editor" 
    ? title 
    : (isCode ? "Code Editor" : "Explanation Panel");

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-[#1e1b26] rounded-2xl border-2 border-[#eae5d9]">
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
          {isCode ? (
            <Code2 className="w-4 h-4 text-[#f04e7c]" />
          ) : (
            <FileText className="w-4 h-4 text-[#fbc13a]" />
          )}
          <span>{dynamicTitle}</span>
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
        <div className="flex-1 p-6 text-sm text-white/50 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-white/40">
            {isCode ? <Code2 className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
          </div>
          <p className="font-bold text-white/70 mb-1">
            {isCode ? "Coding Terminal Idle" : "Explanation Terminal Idle"}
          </p>
          <p className="text-xs text-white/40 max-w-xs">
            Trigger an obstacle or interactive terminal in-game to open this {isCode ? "code" : "explanation"} editor.
          </p>
        </div>
      ) : (
        <>
          <div className="px-4 py-3 border-b border-white/10 bg-white/5">
            <div className="text-[11px] font-bold tracking-widest text-white/50 uppercase">
              {isCode ? "Coding Challenge" : "Concept Challenge"}
            </div>
            <div className="mt-1 text-sm font-semibold text-[#fbc13a] whitespace-pre-wrap">
              {question || (isCode ? "Write your solution below." : "Write your explanation below.")}
            </div>
          </div>

          <div
            className="flex-1 relative"
            onKeyDown={(e) => e.stopPropagation()}
            onKeyUp={(e) => e.stopPropagation()}
          >
            {isCode ? (
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
            ) : (
              <div className="w-full h-full p-4 flex flex-col">
                <textarea
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Type your explanation or answer in simple words..."
                  className="w-full flex-1 bg-[#14121a] border-2 border-white/10 rounded-xl p-4 text-sm font-medium text-white placeholder-white/30 focus:outline-none focus:border-[#fbc13a] focus:ring-1 focus:ring-[#fbc13a] resize-none transition-colors leading-relaxed"
                  autoFocus
                />
                <p className="text-[11px] text-white/40 mt-2 font-medium">
                  💡 Explain the concept clearly in 1–3 sentences.
                </p>
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t border-white/10 flex items-center justify-end gap-2 bg-[#171420]">
            <button
              onClick={closeAsWrong}
              className="px-3 py-2 rounded-xl text-sm font-bold border border-white/10 text-white/70 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              className="px-5 py-2 rounded-xl text-sm font-black bg-gradient-to-r from-[#00cc44] to-[#008833] text-white shadow-[0_8px_30px_rgba(0,204,68,0.18)] hover:brightness-110 active:scale-95 transition-all"
            >
              Submit {isCode ? "Code" : "Answer"}
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
