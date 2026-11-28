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
 * Índice do `)` que fecha o `(` em `openIndex`, contando parênteses
 * aninhados, mesmo em outra linha. Para no `;` que encerra o comando:
 * sem `)` até ali, retorna -1 (o parêntese ficou aberto).
 */
function findClosingParen(tokens: Token[], openIndex: number) {
  let depth = 0;

  for (let i = openIndex; i < tokens.length; i += 1) {
    const { type } = tokens[i];

    if (type === 'semicolon') return -1;
    if (type === 'leftParen') depth += 1;
    if (type === 'rightParen') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }

  return -1;
}

/**
 * Indica se, a partir de `from`, há um `;` na mesma linha do token anterior,
 * antes de outro comando. Diferencia `Andar()x;` (sobrou o `x`) de
 * `Andar() Pare();` e de `Andar()` seguido de outra linha.
 */
function semicolonLaterOnLine(tokens: Token[], from: number) {
  const line = tokens[from - 1].end.line;

  for (let i = from; i < tokens.length; i += 1) {
    if (tokens[i].start.line !== line || startsCommand(tokens, i)) break;
    if (tokens[i].type === 'semicolon') return true;
  }

  return false;
}

/**
 * Depois de um erro, pula o resto do comando quebrado: para logo após o
 * próximo `;`, no início do próximo comando ou na troca de linha. Assim um
 * erro não vira vários, e as linhas seguintes continuam sendo lidas.
 */
function skipBrokenCommand(tokens: Token[], index: number) {
  const line = tokens[index - 1].end.line;
  let i = index;

  while (
    i < tokens.length &&
    tokens[i].start.line === line &&
    !startsCommand(tokens, i)
  ) {
    if (tokens[i].type === 'semicolon') return i + 1;
    i += 1;
  }

  return i;
}

/** Lê um comando `Nome();` a partir de `index` e aponta o 1º problema. */
function readCommand(tokens: Token[], index: number): CommandRead {
  const broken = (error: Diagnostic, from: number): CommandRead => ({
    ok: false,
    error,
    next: skipBrokenCommand(tokens, from),
  });
  const name = tokens[index];
  const open = tokens[index + 1];

  if (name.type !== 'identifier') return broken(unexpected(name), index + 1);

  if (open?.type !== 'leftParen') {
    const text = `Faltou o "()" depois de "${name.value}".`;
    return broken(diagnostic('missingParens', name, text), index + 1);
  }

  const closeIndex = findClosingParen(tokens, index + 1);

  if (closeIndex === -1) {
    const text = `Faltou fechar o parêntese de "${name.value}(".`;
    return broken(diagnostic('unclosedParen', open, text), index + 2);
  }

  const close = tokens[closeIndex];
  const after = tokens[closeIndex + 1];

  if (closeIndex > index + 2) {
    // Algo entre os parênteses, como em `Andar(Pare());`: um só erro, no
    // primeiro token, e o resto do comando (até o `;`) é descartado, para que
    // `Andar(2)x;` não gere um segundo erro no `x`.
    return broken(unexpected(tokens[index + 2]), closeIndex + 1);
  }

  if (after?.type !== 'semicolon') {
    // Sobrou algo antes do `;` da linha, como em `Andar()x;`.
    if (after && semicolonLaterOnLine(tokens, closeIndex + 1)) {
      return broken(unexpected(after), closeIndex + 1);
    }

    // O ";" deveria vir logo depois do ")": é essa a posição apontada. O
    // comando já foi lido por inteiro, então a leitura segue no próximo.
    const spot = { start: close.end, end: close.end };
    const text = `Faltou o ";" no fim de "${name.value}()".`;
    const error = diagnostic('missingSemicolon', spot, text);
    return { ok: false, error, next: closeIndex + 1 };
  }

  const call: FunctionCallNode = {
    type: 'FunctionCall',
    name: name.value,
    start: name.start,
    end: after.end,
  };
  return { ok: true, call, next: closeIndex + 2 };
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
    } else if (known.has(read.call.name)) {
      calls.push(read.call);
    } else {
      errors.push(unknownFunction(read.call, knownNames));
    }
    index = read.next;
  }

  return { calls, errors };
}
