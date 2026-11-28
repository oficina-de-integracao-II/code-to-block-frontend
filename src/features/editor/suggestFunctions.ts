import type { FunctionSummary } from '../functions/functionsApi';

export type FunctionSuggestion = {
  name: string;
  description: string;
  /** Texto inserido ao aceitar a sugestão. */
  insertText: string;
};

/**
 * Funções do catálogo cujo nome começa pelo texto digitado, sem diferenciar
 * maiúsculas e minúsculas, na ordem do catálogo. Sem texto, sugere todas.
 */
export function suggestFunctions(
  functions: readonly FunctionSummary[],
  typed: string,
): FunctionSuggestion[] {
  const prefix = typed.toLowerCase();

  return functions
    .filter((fn) => fn.nome.toLowerCase().startsWith(prefix))
    .map((fn) => ({
      name: fn.nome,
      description: fn.descricao,
      insertText: `${fn.nome}();`,
    }));
}
