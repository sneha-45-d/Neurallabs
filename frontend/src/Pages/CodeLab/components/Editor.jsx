import { useEffect } from "react";
import { Editor as MonacoEditor } from "@monaco-editor/react";

const ACTIONS = {
  JOIN: "join",
  JOINED: "joined",
  DISCONNECTED: "disconnected",
  CODE_CHANGE: "code-change",
  SYNC_CODE: "sync-code",
  LEAVE: "leave",
};

const Editor = ({ socketRef, roomId, language, onCodeChange, editorRef }) => {

  // ✅ Attach Monaco editor instance
  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  // ✅ Handle local code changes (SAFE + CLEAN)
  useEffect(() => {
    if (!editorRef.current || !socketRef.current) return;

    const editor = editorRef.current;

    const disposable = editor.onDidChangeModelContent(() => {
      const code = editor.getValue();

      onCodeChange(code);

      socketRef.current.emit(ACTIONS.CODE_CHANGE, {
        roomId,
        code,
      });
    });

    return () => {
      disposable.dispose(); // cleanup listener
    };
  }, [roomId]);

  // ✅ Handle incoming socket updates
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handler = ({ code }) => {
      const editor = editorRef.current;
      if (!editor) return;

      const currentCode = editor.getValue();

      if (code !== null && currentCode !== code) {
        editor.setValue(code);
      }
    };

    socket.on(ACTIONS.CODE_CHANGE, handler);

    return () => {
      socket.off(ACTIONS.CODE_CHANGE, handler);
    };
  }, [roomId]);

  return (
    <div style={{ height: "75vh" }}>
      <MonacoEditor
        height="100%"
        theme="vs-dark"
        language={language}
        defaultValue={"// Start coding..."}
        onMount={handleEditorDidMount}
      />
    </div>
  );
};

export default Editor;