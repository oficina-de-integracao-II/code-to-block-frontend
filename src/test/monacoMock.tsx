import { useEffect, useRef } from 'react';
import type { EditorProps } from '@monaco-editor/react';

/**
 * Substitui o Monaco nos testes por um <textarea>, já que o jsdom não
 * suporta o editor real. Simula apenas o necessário: onChange, onMount
 * e uma instância com getSelection, executeEdits e focus.
 */
export function MockMonacoEditor({ defaultValue, onChange, onMount, options }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current!;

    const instance = {
      getSelection: () => ({}),
      focus: () => textarea.focus(),
      executeEdits: (_source: string, edits: { text: string }[]) => {
        const { selectionStart, selectionEnd, value: current } = textarea;
        const next = current.slice(0, selectionStart) + edits[0].text + current.slice(selectionEnd);
        textarea.value = next;
        onChange?.(next, {} as never);
        return true;
      },
    };

    onMount?.(instance as never, {} as never);
    // Monta uma única vez, como o Monaco real.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <textarea
      ref={textareaRef}
      aria-label={options?.ariaLabel}
      placeholder={options?.placeholder}
      defaultValue={defaultValue}
      onChange={(event) => onChange?.(event.target.value, {} as never)}
    />
  );
}
