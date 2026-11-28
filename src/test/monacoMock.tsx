import { useEffect, useRef, useState } from 'react';
import type { EditorProps } from '@monaco-editor/react';
import type { editor, languages } from 'monaco-editor';

type Suggestion = languages.CompletionItem & {
  label: languages.CompletionItemLabel;
  range: { startColumn: number; endColumn: number };
};

/**
 * Substitui o Monaco nos testes por um <textarea>, já que o jsdom não
 * suporta o editor real. Simula apenas o necessário: onChange, onMount
 * e uma instância com getSelection, executeEdits, focus, getModel,
 * setPosition e pushUndoStop. Os marcadores de erro aparecem numa lista,
 * com o intervalo em `data-range` (linha:coluna-linha:coluna). As sugestões
 * da palavra antes do cursor aparecem em outra lista; clicar aceita. Nas
 * sugestões, a coluna conta o texto todo, como se fosse uma linha só.
 */
export function MockMonacoEditor({ defaultValue, onChange, onMount, options }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const providerRef = useRef<languages.CompletionItemProvider | null>(null);
  const [markers, setMarkers] = useState<editor.IMarkerData[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  function updateSuggestions() {
    const textarea = textareaRef.current!;
    const before = textarea.value.slice(0, textarea.selectionStart);
    const word = /[\p{L}\p{N}_]*$/u.exec(before)![0];

    // Como no Monaco, as sugestões só abrem enquanto uma palavra é digitada.
    if (!providerRef.current || !word) {
      setSuggestions([]);
      return;
    }

    const model = {
      getWordUntilPosition: () => ({
        word,
        startColumn: before.length - word.length + 1,
        endColumn: before.length + 1,
      }),
    };
    const position = { lineNumber: 1, column: before.length + 1 };
    const result = providerRef.current.provideCompletionItems(
      model as never,
      position as never,
      {} as never,
      {} as never,
    ) as languages.CompletionList;

    setSuggestions(result.suggestions as Suggestion[]);
  }

  function acceptSuggestion({ insertText, range }: Suggestion) {
    const textarea = textareaRef.current!;
    const current = textarea.value;
    const next =
      current.slice(0, range.startColumn - 1) + insertText + current.slice(range.endColumn - 1);

    textarea.value = next;
    onChange?.(next, {} as never);
    setSuggestions([]);
  }

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
      languages: {
        CompletionItemKind: { Function: 1 },
        registerCompletionItemProvider: (
          _language: string,
          provider: languages.CompletionItemProvider,
        ) => {
          providerRef.current = provider;
          // O React limpa o efeito antigo antes de registrar o novo provedor.
          return { dispose: () => (providerRef.current = null) };
        },
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
        onChange={(event) => {
          onChange?.(event.target.value, {} as never);
          updateSuggestions();
        }}
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
      <ul aria-label="Sugestões">
        {suggestions.map((suggestion) => (
          <li key={suggestion.label.label}>
            <button type="button" onClick={() => acceptSuggestion(suggestion)}>
              {suggestion.label.label}
            </button>
            <span>{suggestion.label.description}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
