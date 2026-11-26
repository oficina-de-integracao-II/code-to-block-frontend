import type { Position, Token, TokenType } from './types';

type Rule = {
  /** `null` indica um trecho que é consumido sem gerar token. */
  type: TokenType | null;
  pattern: RegExp;
};

// A ordem importa: vale a primeira regra que casar na posição atual.
// Todos os padrões usam a flag `y` (sticky) para casar só a partir dela.
const RULES: Rule[] = [
  // Espaços e quebras de linha.
  { type: null, pattern: /\s+/y },
  // Comentário de linha.
  { type: null, pattern: /\/\/[^\r\n]*/y },
  // Comentário de bloco.
  { type: null, pattern: /\/\*[\s\S]*?\*\//y },
  // Comentário de bloco sem `*/`: vai até o fim do texto e vira um token,
  // para que a validação possa avisar (o `parseCalls` o ignora).
  { type: 'unclosedComment', pattern: /\/\*[\s\S]*/y },
  // Literais de texto e de caractere viram um token só, para que o conteúdo
  // não seja lido como código. Sem a aspa final, param no fim da linha.
  { type: 'unknown', pattern: /"(?:\\.|[^"\\\r\n])*"?/y },
  { type: 'unknown', pattern: /'(?:\\.|[^'\\\r\n])*'?/y },
  // Aceita letras acentuadas, para que `Avançar` não seja quebrado em partes.
  { type: 'identifier', pattern: /[\p{ID_Start}_]\p{ID_Continue}*/uy },
  // Palavra iniciada por número, como `2Andar`, não é um nome válido.
  { type: 'unknown', pattern: /\p{ID_Continue}+/uy },
  { type: 'leftParen', pattern: /\(/y },
  { type: 'rightParen', pattern: /\)/y },
  { type: 'semicolon', pattern: /;/y },
  // Qualquer outro caractere.
  { type: 'unknown', pattern: /[\s\S]/uy },
];

const LINE_BREAK = /\r\n|\r|\n/;

function matchAt(source: string, offset: number) {
  for (const { type, pattern } of RULES) {
    pattern.lastIndex = offset;
    const match = pattern.exec(source);
    if (match) return { type, value: match[0] };
  }

  // Inalcançável: a última regra casa com qualquer caractere.
  /* v8 ignore next */
  throw new Error(`Nenhuma regra casou na posição ${offset}.`);
}

function advance(from: Position, text: string): Position {
  const lines = text.split(LINE_BREAK);
  const lastLength = lines[lines.length - 1].length;

  return lines.length === 1
    ? { line: from.line, column: from.column + lastLength }
    : { line: from.line + lines.length - 1, column: lastLength + 1 };
}

/** Divide o texto em tokens, descartando espaços e comentários. */
export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let offset = 0;
  let position: Position = { line: 1, column: 1 };

  while (offset < source.length) {
    const { type, value } = matchAt(source, offset);
    const end = advance(position, value);

    if (type) tokens.push({ type, value, start: position, end });

    offset += value.length;
    position = end;
  }

  return tokens;
}
