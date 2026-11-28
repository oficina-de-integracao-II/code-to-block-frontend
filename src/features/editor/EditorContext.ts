import type { Monaco } from '@monaco-editor/react';
import { createContext, useContext } from 'react';
import type { editor } from 'monaco-editor';

export type CodeEditorInstance = editor.IStandaloneCodeEditor;

/** Editor já montado, com a API do Monaco recebida no `onMount`. */
export type MountedEditor = {
  editor: CodeEditorInstance;
  monaco: Monaco;
};

export type EditorContextValue = {
  code: string;
  setCode: (code: string) => void;
  registerEditor: (instance: CodeEditorInstance | null) => void;
  insertFunctionCall: (functionName: string) => void;
};

export const EditorContext = createContext<EditorContextValue | undefined>(undefined);

export function useEditor() {
  const context = useContext(EditorContext);

  if (!context) {
    throw new Error('useEditor deve ser usado dentro de um EditorProvider');
  }

  return context;
}
