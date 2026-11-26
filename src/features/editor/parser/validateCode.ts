import { suggestName } from './suggestName';
import { tokenize } from './tokenize';
import type {
  Diagnostic,
  DiagnosticCode,
  FunctionCallNode,
  Position,
  SourceRange,
  Token,
  ValidationResult,
} from './types';

/** Resultado da leitura de um comando a partir de um token. */
type CommandRead =
  | { ok: true; call: FunctionCallNode; next: number }
  | { ok: false; error: Diagnostic; next: number };

const at = ({ line, column }: Position) =>
  `(linha ${line}, coluna ${column})`;

function diagnostic(
  code: DiagnosticCode,
  range: SourceRange,
  text: string,
  suggestion?: string,
): Diagnostic {
  return {
    code,
    message: `${text} ${at(range.start)}`,
    start: range.start,
    end: range.end,
    ...(suggestion && { suggestion }),
  };
}

/** Erro para um trecho que não cabe em nenhum comando. */
function unexpected(token: Token) {
  if (token.type === 'unclosedComment') {
    // Marca só o `/*`: o resto do texto é o próprio comentário.
    const opening = {
      start: token.start,
      end: { line: token.start.line, column: token.start.column + 2 },
    };
    return diagnostic(
      'unclosedComment',
      opening,
      'Faltou fechar o comentário com "*/".',
    );
  }

  // Textos entre aspas já vêm com aspas: repetir o valor fica confuso.
  const isText = token.value.startsWith('"') || token.value.startsWith("'");
  const text = isText
    ? 'Hmm, textos entre aspas não são comandos.'
    : `Hmm, não esperava "${token.value}" aqui.`;

  return diagnostic('unexpectedToken', token, text);
}

/** Um comando começa num nome seguido de `(`. */
function startsCommand(tokens: Token[], index: number) {
  return (
    tokens[index]?.type === 'identifier' &&
    tokens[index + 1]?.type === 'leftParen'
  );
}

/**
 * Indica se o `(` em `openIndex` é fechado mais adiante, na mesma linha e
 * antes do fim do comando. Diferencia `Andar(x);` de `Andar(`.
 */
function closesLaterOnLine(tokens: Token[], openIndex: number) {
  const line = tokens[openIndex].start.line;

  for (let i = openIndex + 1; i < tokens.length; i += 1) {
    const token = tokens[i];
    const commandEnded =
      token.start.line !== line ||
      token.type === 'semicolon' ||
      startsCommand(tokens, i);

    if (commandEnded) return false;
    if (token.type === 'rightParen') return true;
  }

  return false;
}

/** Lê um comando `Nome();` a partir de `index` e aponta o 1º problema. */
function readCommand(tokens: Token[], index: number): CommandRead {
  const [name, open, close, semicolon] = tokens.slice(index, index + 4);

  if (name.type !== 'identifier') {
    return { ok: false, error: unexpected(name), next: index + 1 };
  }

  if (open?.type !== 'leftParen') {
    const error = diagnostic(
      'missingParens',
      name,
      `Faltou o "()" depois de "${name.value}".`,
    );
    return { ok: false, error, next: index + 1 };
  }

  if (close?.type !== 'rightParen') {
    const error = closesLaterOnLine(tokens, index + 1)
      ? unexpected(close)
      : diagnostic(
          'unclosedParen',
          open,
          `Faltou fechar o parêntese de "${name.value}(".`,
        );
    return { ok: false, error, next: index + 2 };
  }

  if (semicolon?.type !== 'semicolon') {
    // O ";" deveria vir logo depois do ")": é essa a posição apontada.
    const spot = { start: close.end, end: close.end };
    const error = diagnostic(
      'missingSemicolon',
      spot,
      `Faltou o ";" no fim de "${name.value}()".`,
    );
    return { ok: false, error, next: index + 3 };
  }

  const call: FunctionCallNode = {
    type: 'FunctionCall',
    name: name.value,
    start: name.start,
    end: semicolon.end,
  };
  return { ok: true, call, next: index + 4 };
}

/**
 * Depois de um erro, pula o resto do comando quebrado: para logo após o
 * próximo `;` ou no início do próximo comando. Assim um erro não vira
 * vários.
 */
function skipBrokenCommand(tokens: Token[], index: number) {
  let i = index;

  while (i < tokens.length && !startsCommand(tokens, i)) {
    if (tokens[i].type === 'semicolon') return i + 1;
    i += 1;
  }

  return i;
}

/** Marca o comando inteiro, como o sublinhado do protótipo. */
function unknownFunction(
  call: FunctionCallNode,
  knownNames: readonly string[],
) {
  const suggestion = suggestName(call.name, knownNames);
  const hint = suggestion ? ` Você quis dizer "${suggestion}"?` : '';

  return diagnostic(
    'unknownFunction',
    call,
    `Hmm, não conheço "${call.name}".${hint}`,
    suggestion,
  );
}

/**
 * Valida o texto do editor contra os nomes do catálogo. Retorna as chamadas
 * válidas, na ordem do texto, e um erro para cada comando com problema.
 * Nunca lança exceção: um erro não impede a leitura dos comandos seguintes.
 */
export function validateCode(
  source: string,
  knownNames: readonly string[],
): ValidationResult {
  const tokens = tokenize(source);
  const known = new Set(knownNames);
  const calls: FunctionCallNode[] = [];
  const errors: Diagnostic[] = [];
  let index = 0;

  while (index < tokens.length) {
    const read = readCommand(tokens, index);

    if (!read.ok) {
      errors.push(read.error);
      index = skipBrokenCommand(tokens, read.next);
      continue;
    }

    if (known.has(read.call.name)) {
      calls.push(read.call);
    } else {
      errors.push(unknownFunction(read.call, knownNames));
    }
    index = read.next;
  }

  return { calls, errors };
}
