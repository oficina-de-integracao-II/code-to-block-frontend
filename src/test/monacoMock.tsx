import { useEffect, useRef, useState } from 'react';
import type { EditorProps } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

/**
 * Substitui o Monaco nos testes por um <textarea>, já que o jsdom não
 * suporta o editor real. Simula apenas o necessário: onChange, onMount
 * e uma instância com getSelection, executeEdits, focus, getModel,
 * setPosition e pushUndoStop. Os marcadores de erro aparecem numa lista,
 * com o intervalo em `data-range` (linha:coluna-linha:coluna).
 */
export function MockMonacoEditor({ defaultValue, onChange, onMount, options }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [markers, setMarkers] = useState<editor.IMarkerData[]>([]);

  useEffect(() => {
    const textarea = textareaRef.current!;

    const instance = {
      getSelection: () => ({}),
      focus: () => textarea.focus(),
      pushUndoStop: () => true,
      // O cursor do textarea faz o papel da posição do Monaco.
      getModel: () => ({
        getFullModelRange: () => ({ getEndPosition: () => textarea.value.length }),
      }),
      setPosition: (offset: number) => textarea.setSelectionRange(offset, offset),
      executeEdits: (_source: string, edits: { text: string }[]) => {
        const { selectionStart, selectionEnd, value: current } = textarea;
        const next = current.slice(0, selectionStart) + edits[0].text + current.slice(selectionEnd);
        textarea.value = next;
        onChange?.(next, {} as never);
        return true;
      },
    };

    const monaco = {
      MarkerSeverity: { Warning: 4 },
      editor: {
        setModelMarkers: (_model: unknown, _owner: string, next: editor.IMarkerData[]) =>
          setMarkers(next),
      },
    };

    onMount?.(instance as never, monaco as never);
    // Monta uma única vez, como o Monaco real.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <textarea
        ref={textareaRef}
        aria-label={options?.ariaLabel}
        placeholder={options?.placeholder}
        defaultValue={defaultValue}
        onChange={(event) => onChange?.(event.target.value, {} as never)}
      />
      <ul aria-label="Marcadores de erro">
        {markers.map((marker) => {
          const range = `${marker.startLineNumber}:${marker.startColumn}-${marker.endLineNumber}:${marker.endColumn}`;
          return (
            <li key={range} data-range={range}>
              {marker.message}
            </li>
          );
        })}
      </ul>
    </>
  );
}
