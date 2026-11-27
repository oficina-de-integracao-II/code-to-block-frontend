import Editor, { type OnMount } from '@monaco-editor/react';
import { useEffect, useMemo } from 'react';
import './monacoSetup';
import { useEditor } from './EditorContext';
import { EDITOR_THEME_NAME } from './editorTheme';

const EDITOR_OPTIONS = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 18,
  lineHeight: 28,
  padding: { top: 20, bottom: 20 },
  placeholder: '// Digite uma função, por exemplo: Andar();',
  minimap: { enabled: false },
  folding: false,
  glyphMargin: false,
  lineNumbersMinChars: 1,
  overviewRulerLanes: 0,
  renderLineHighlight: 'none' as const,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  // Sugestões virão só do catálogo de funções (FE-17), não de palavras soltas.
  wordBasedSuggestions: 'off' as const,
  ariaLabel: 'Editor de código',
};

export function CodeEditor() {
  const { code, setCode, registerEditor } = useEditor();

  const handleMount: OnMount = (instance) => registerEditor(instance);

  useEffect(() => () => registerEditor(null), [registerEditor]);

  // Como no protótipo, o editor vazio mostra só o placeholder, sem numeração.
  const isEmpty = code === '';
  const options = useMemo(
    () => ({
      ...EDITOR_OPTIONS,
      lineNumbers: isEmpty ? ('off' as const) : ('on' as const),
      // Espaço entre número e código equivalente a "1  Andar();" no protótipo.
      lineDecorationsWidth: isEmpty ? 0 : 22,
    }),
    [isEmpty],
  );

  return (
    // Recuo de 20px à esquerda, como no protótipo (o Monaco não tem padding lateral).
    <div className="h-full pl-5">
      {/* O Monaco é a fonte do texto (defaultValue) e o estado acompanha via onChange.
          Usar `value` controlado faz o editor perder teclas em digitação rápida. */}
      <Editor
        defaultValue={code}
        onChange={(value) => setCode(value ?? '')}
        onMount={handleMount}
        language="plaintext"
        theme={EDITOR_THEME_NAME}
        options={options}
        loading={<p className="py-5 text-sm text-editor-gutter">Carregando editor...</p>}
      />
    </div>
  );
}
