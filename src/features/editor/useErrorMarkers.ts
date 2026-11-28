import type { Monaco } from '@monaco-editor/react';
import type { editor, MarkerSeverity } from 'monaco-editor';
import { useEffect, useMemo } from 'react';
import { useFunctions } from '../functions/FunctionsContext';
import type { CodeEditorInstance } from './EditorContext';
import { validateCode, type Diagnostic } from './parser';

/** Editor já montado, com a API do Monaco recebida no `onMount`. */
export type MountedEditor = {
  editor: CodeEditorInstance;
  monaco: Monaco;
};

// Identifica os marcadores do parser, para que cada validação substitua a anterior.
const MARKER_OWNER = 'parser';

function toMarker(
  { message, start, end }: Diagnostic,
  severity: MarkerSeverity,
): editor.IMarkerData {
  return {
    severity,
    message,
    startLineNumber: start.line,
    startColumn: start.column,
    endLineNumber: end.line,
    endColumn: end.column,
  };
}

/**
 * Sublinha no editor os erros do parser, com a mensagem ao passar o mouse.
 * Roda a cada alteração do código: erros corrigidos somem na hora.
 */
export function useErrorMarkers(mounted: MountedEditor | null, code: string) {
  const { functions, loading, error } = useFunctions();
  const knownNames = useMemo(() => functions.map((fn) => fn.nome), [functions]);
  const catalogReady = !loading && !error;

  useEffect(() => {
    const model = mounted?.editor.getModel();
    if (!mounted || !model) return;

    const { errors } = validateCode(code, knownNames);
    // Sem o catálogo, todo nome pareceria desconhecido: marca só a sintaxe.
    const shown = catalogReady
      ? errors
      : errors.filter((diagnostic) => diagnostic.code !== 'unknownFunction');

    const { monaco } = mounted;
    const markers = shown.map((diagnostic) =>
      toMarker(diagnostic, monaco.MarkerSeverity.Warning),
    );
    monaco.editor.setModelMarkers(model, MARKER_OWNER, markers);
  }, [mounted, code, knownNames, catalogReady]);
}
