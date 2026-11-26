// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { tokenize } from './index';

describe('tokenize', () => {
  it('classifica cada elemento de uma chamada', () => {
    expect(tokenize('Andar();').map(({ type, value }) => [type, value])).toEqual([
      ['identifier', 'Andar'],
      ['leftParen', '('],
      ['rightParen', ')'],
      ['semicolon', ';'],
    ]);
  });

  it('preserva caracteres inesperados com a posição deles', () => {
    expect(tokenize('\n  @')).toEqual([
      {
        type: 'unknown',
        value: '@',
        start: { line: 2, column: 3 },
        end: { line: 2, column: 4 },
      },
    ]);
  });

  it('não divide um caractere fora do plano básico', () => {
    expect(tokenize('🤖').map((token) => token.value)).toEqual(['🤖']);
  });

  it('descarta espaços e comentários', () => {
    expect(tokenize(' \n// a\n/* b */\t')).toEqual([]);
  });

  it('transforma comentário de bloco não fechado em um token até o fim', () => {
    expect(tokenize('Pare /* a\nb')).toEqual([
      {
        type: 'identifier',
        value: 'Pare',
        start: { line: 1, column: 1 },
        end: { line: 1, column: 5 },
      },
      {
        type: 'unclosedComment',
        value: '/* a\nb',
        start: { line: 1, column: 6 },
        end: { line: 2, column: 2 },
      },
    ]);
  });
});
