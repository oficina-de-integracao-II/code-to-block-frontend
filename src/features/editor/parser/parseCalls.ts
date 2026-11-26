import { tokenize } from './tokenize';
import type { FunctionCallNode, Token, TokenType } from './types';

const CALL_SHAPE: TokenType[] = [
  'identifier',
  'leftParen',
  'rightParen',
  'semicolon',
];

function isCallAt(tokens: Token[], index: number) {
  return CALL_SHAPE.every((type, i) => tokens[index + i]?.type === type);
}

/**
 * Converte o texto do editor na lista de chamadas `Nome();`, na ordem em que
 * aparecem. Trechos fora desse formato são ignorados, sem lançar exceção.
 * Não consulta o catálogo: qualquer nome válido é aceito.
 */
export function parseCalls(source: string): FunctionCallNode[] {
  const tokens = tokenize(source);
  const calls: FunctionCallNode[] = [];
  let index = 0;

  while (index < tokens.length) {
    if (!isCallAt(tokens, index)) {
      index += 1;
      continue;
    }

    const name = tokens[index];
    const semicolon = tokens[index + CALL_SHAPE.length - 1];

    calls.push({
      type: 'FunctionCall',
      name: name.value,
      start: name.start,
      end: semicolon.end,
    });
    index += CALL_SHAPE.length;
  }

  return calls;
}
