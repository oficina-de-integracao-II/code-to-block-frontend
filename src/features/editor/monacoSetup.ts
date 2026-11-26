import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import { EDITOR_THEME_NAME, editorTheme } from './editorTheme';

// Usa o Monaco empacotado pelo Vite em vez de baixá-lo de uma CDN.
// O import completo inclui placeholder, hover e sugestões (FE-16/FE-17);
// `editor.api` traz só o núcleo, sem esses recursos.
self.MonacoEnvironment = {
  getWorker: () => new EditorWorker(),
};

loader.config({ monaco });

monaco.editor.defineTheme(EDITOR_THEME_NAME, editorTheme);
