import type { editor } from 'monaco-editor';

// Cores do protótipo (variáveis color/editor-* do Figma).
export const EDITOR_THEME_NAME = 'code-to-blocks';

export const editorTheme: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#16263f',
    'editor.foreground': '#f2f7ff',
    'editor.placeholder.foreground': '#a9bcd6',
    'editorLineNumber.foreground': '#f2f7ff',
    'editorLineNumber.activeForeground': '#f2f7ff',
    'editorCursor.foreground': '#f2f7ff',
  },
};
