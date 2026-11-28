import type { editor, Position } from 'monaco-editor';
import { useEffect } from 'react';
import { useFunctions } from '../functions/FunctionsContext';
import type { MountedEditor } from './EditorContext';
import { suggestFunctions } from './suggestFunctions';

/**
 * Sugere as funções do catálogo enquanto o usuário digita. Aceitar uma
 * sugestão troca a palavra digitada por `Nome();`.
 */
export function useFunctionSuggestions(mounted: MountedEditor | null) {
  const { functions } = useFunctions();

  useEffect(() => {
    if (!mounted) return;

    const { monaco } = mounted;
    const provider = monaco.languages.registerCompletionItemProvider('plaintext', {
      provideCompletionItems(model: editor.ITextModel, position: Position) {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = suggestFunctions(functions, word.word).map((fn, index) => ({
          // A descrição vai no rótulo para aparecer sempre, como no protótipo.
          label: { label: fn.name, description: fn.description },
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: fn.insertText,
          range,
          // Mantém a ordem do catálogo; sem isso o Monaco ordena pelo nome.
          sortText: String(index).padStart(4, '0'),
        }));

        // `incomplete` faz o Monaco pedir a lista de novo a cada tecla. Sem isso,
        // ele refiltra sozinho por aproximação: `VD` mostraria `VireDireita`.
        return { suggestions, incomplete: true };
      },
    });

    // Com o catálogo atualizado, o provedor antigo sai e entra um novo.
    return () => provider.dispose();
  }, [mounted, functions]);
}
