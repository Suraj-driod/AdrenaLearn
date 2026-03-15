"use client";

import Editor from "@monaco-editor/react";

export default function CodeEditor({ onSubmit }) {
   

  const handleSubmit = () => {
    const code = window.editorValue;
    onSubmit(code);
  };

  return (
    <div style={{height:"400px",background:"black"}}>

      <h3>Question: Write a function that returns the sum of two numbers</h3>

      <Editor
        height="300px"
        defaultLanguage="python"
        defaultValue="// write your code"
        onChange={(value)=> window.editorValue=value}
      />

      <button onClick={handleSubmit}>Submit</button>

    </div>
  );
}