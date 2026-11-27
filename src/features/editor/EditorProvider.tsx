import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { EditorContext, type CodeEditorInstance } from './EditorContext';

function formatFunctionCall(functionName: string) {
  return `${functionName}();`;
}

export function EditorProvider({ children }: { children: ReactNode }) {
  const [code, setCode] = useState('');
  const editorRef = useRef<CodeEditorInstance | null>(null);

  const registerEditor = useCallback((instance: CodeEditorInstance | null) => {
    editorRef.current = instance;

    // O Monaco abre com o cursor no início. Leva o cursor ao fim para que as
    // chamadas inseridas antes de ele montar continuem na ordem dos cliques.
    const model = instance?.getModel();
    if (instance && model) {
      instance.setPosition(model.getFullModelRange().getEndPosition());
    }
  }, []);

  const insertFunctionCall = useCallback((functionName: string) => {
    const text = formatFunctionCall(functionName);
    const editor = editorRef.current;
    const selection = editor?.getSelection();

    if (!editor || !selection) {
      setCode((current) => current + text);
      return;
    }

    // A edição dispara o onChange do editor, que atualiza o estado `code`.
    // Os undo stops fazem o Ctrl+Z desfazer só esta inserção.
    editor.pushUndoStop();
    editor.executeEdits('functions-panel', [
      { range: selection, text, forceMoveMarkers: true },
    ]);
    editor.pushUndoStop();
    editor.focus();
  }, []);

  const value = useMemo(
    () => ({ code, setCode, registerEditor, insertFunctionCall }),
    [code, registerEditor, insertFunctionCall],
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}
