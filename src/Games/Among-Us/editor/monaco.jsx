"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

export default function CodeEditor({ onSubmit }) {
  const [question, setQuestion] = useState("Write your code below");

  useEffect(() => {
    // Read the dynamic question set by the Phaser game
    if (window.currentAmongQuestion) {
      setQuestion(window.currentAmongQuestion);
    }
  }, []);

  const handleSubmit = () => {
    const code = window.editorValue;
    onSubmit(code);
  };

  const handleClose = () => {
    // Closing without submitting counts as wrong
    onSubmit(null);
  };

  return (
    <div
      onKeyDown={(e) => e.stopPropagation()}
      onKeyUp={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        style={{
          width: "680px",
          maxWidth: "95vw",
          background: "#1e1e2e",
          borderRadius: "20px",
          border: "2px solid #444",
          boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
          overflow: "hidden",
          fontFamily: "'Segoe UI', Arial, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            background: "linear-gradient(135deg, #cc0000 0%, #880000 100%)",
            borderBottom: "2px solid #550000",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "22px" }}>🧑‍💻</span>
            <span
              style={{
                color: "#fff",
                fontSize: "16px",
                fontWeight: "800",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              Code Challenge
            </span>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: "rgba(0,0,0,0.4)",
              border: "2px solid rgba(255,255,255,0.3)",
              color: "#fff",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              fontSize: "18px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              e.target.style.background = "rgba(255,0,0,0.6)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "rgba(0,0,0,0.4)";
            }}
          >
            ✕
          </button>
        </div>

        {/* Question */}
        <div
          style={{
            padding: "16px 24px",
            background: "#252540",
            borderBottom: "1px solid #333",
          }}
        >
          <div
            style={{
              color: "#888",
              fontSize: "11px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginBottom: "6px",
            }}
          >
            📝 Your Task
          </div>
          <div
            style={{
              color: "#ffd700",
              fontSize: "16px",
              fontWeight: "700",
              lineHeight: "1.5",
            }}
          >
            {question}
          </div>
        </div>

        {/* Editor */}
        <div style={{ padding: "0" }}>
          <Editor
            height="280px"
            defaultLanguage="python"
            defaultValue={"# Write your Python code here\n\ndef solution():\n    pass\n"}
            onChange={(value) => (window.editorValue = value)}
            theme="vs-dark"
            options={{
              fontSize: 15,
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

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 24px",
            background: "#1a1a2e",
            borderTop: "1px solid #333",
          }}
        >
          <span style={{ color: "#666", fontSize: "12px" }}>
            Python 3 • Write a function that solves the task
          </span>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleClose}
              style={{
                padding: "10px 24px",
                borderRadius: "10px",
                border: "2px solid #555",
                background: "transparent",
                color: "#aaa",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                e.target.style.borderColor = "#888";
                e.target.style.color = "#fff";
              }}
              onMouseOut={(e) => {
                e.target.style.borderColor = "#555";
                e.target.style.color = "#aaa";
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              style={{
                padding: "10px 32px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #00cc44 0%, #008833 100%)",
                color: "#fff",
                fontSize: "14px",
                fontWeight: "800",
                cursor: "pointer",
                letterSpacing: "0.5px",
                boxShadow: "0 4px 15px rgba(0,204,68,0.3)",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 6px 20px rgba(0,204,68,0.5)";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(0,204,68,0.3)";
              }}
            >
              ▶ Submit Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}