import type { editor } from 'monaco-editor';

// Cores do protótipo (variáveis color/editor-* do Figma). Os marcadores de
// erro usam color/sun no sublinhado e color/soft-warn e color/ink no tooltip;
// as sugestões usam color/surface, color/bg (opção ativa) e color/ink.
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
    'editorWarning.foreground': '#f7ca1b',
    'editorHoverWidget.background': '#ffe9b8',
    'editorHoverWidget.foreground': '#1f2a44',
    'editorHoverWidget.border': '#ffe9b8',
    // Sem realce de fundo no trecho sob o mouse: o protótipo mostra só o sublinhado.
    'editor.hoverHighlightBackground': '#00000000',
    'editorSuggestWidget.background': '#ffffff',
    'editorSuggestWidget.border': '#ffffff',
    'editorSuggestWidget.foreground': '#1f2a44',
    'editorSuggestWidget.selectedBackground': '#eef6ff',
    'editorSuggestWidget.selectedForeground': '#1f2a44',
    'editorSuggestWidget.highlightForeground': '#1f2a44',
    'editorSuggestWidget.focusHighlightForeground': '#1f2a44',
  },
};
