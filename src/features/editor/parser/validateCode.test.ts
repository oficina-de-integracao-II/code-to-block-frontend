// @vitest-environment node
// Roda sem jsdom para garantir que o parser não depende do DOM.
import { describe, expect, it } from 'vitest';
import { parseCalls, validateCode } from './index';
import type { DiagnosticCode } from './index';

const CATALOG = [
  'Andar',
  'ParaFrente',
  'ParaTras',
  'VireEsquerda',
  'VireDireita',
  'Pare',
];

const validate = (source: string) => validateCode(source, CATALOG);
const callNames = (source: string) =>
  validate(source).calls.map((call) => call.name);

/** Resume um erro em código, posição `[linha, coluna]` e mensagem. */
function errorsOf(source: string) {
  return validate(source).errors.map(({ code, start, message }) => ({
    code,
    at: [start.line, start.column],
    message,
  }));
}

function error(
  code: DiagnosticCode,
  [line, column]: [number, number],
  message: string,
) {
  return { code, at: [line, column], message };
}

describe('validateCode: código válido', () => {
  it('retorna as chamadas do catálogo, na ordem, sem erros', () => {
    const source = 'Andar();\nVireEsquerda();\nPare();';

    expect(validate(source)).toEqual({
      calls: parseCalls(source),
      errors: [],
    });
  });

  it.each([
    ['vazio', ''],
    ['só com espaços e quebras de linha', '  \n\t\r\n '],
    ['só com comentários', '// Andarr();\n/* Pare( */'],
  ])('não acusa erro em texto %s', (_caso, source) => {
    expect(validate(source)).toEqual({ calls: [], errors: [] });
  });
});

describe('validateCode: função inexistente', () => {
  it('marca o comando e sugere o nome com a mensagem do protótipo', () => {
    const result = validate('Andar();\nAndarr();\nPare();');

    expect(result.calls.map((call) => call.name)).toEqual(['Andar', 'Pare']);
    expect(result.errors).toEqual([
      {
        code: 'unknownFunction',
        message:
          'Hmm, não conheço "Andarr". Você quis dizer "Andar"? ' +
          '(linha 2, coluna 1)',
        suggestion: 'Andar',
        start: { line: 2, column: 1 },
        end: { line: 2, column: 10 },
      },
    ]);
  });

  it('ignora maiúsculas e minúsculas ao sugerir', () => {
    expect(validate('andar();').errors[0].suggestion).toBe('Andar');
  });

  it.each(['Voar', 'Vire'])('não sugere nada para "%s"', (name) => {
    const [found] = validate(`${name}();`).errors;

    expect(found.message).toBe(
      `Hmm, não conheço "${name}". (linha 1, coluna 1)`,
    );
    expect(found).not.toHaveProperty('suggestion');
  });

  it('acusa todas as chamadas quando o catálogo está vazio', () => {
    const result = validateCode('Andar();', []);

    expect(result.calls).toEqual([]);
    expect(result.errors.map((found) => found.code)).toEqual([
      'unknownFunction',
    ]);
  });
});

describe('validateCode: erros de sintaxe com posição', () => {
  it('aponta onde falta o ";", logo depois do ")"', () => {
    expect(errorsOf('Andar()\nPare();')).toEqual([
      error(
        'missingSemicolon',
        [1, 8],
        'Faltou o ";" no fim de "Andar()". (linha 1, coluna 8)',
      ),
    ]);
    expect(callNames('Andar()\nPare();')).toEqual(['Pare']);
  });

  it('aponta o parêntese que não foi fechado', () => {
    expect(errorsOf('Andar();\n  Pare(\nAndar();')).toEqual([
      error(
        'unclosedParen',
        [2, 7],
        'Faltou fechar o parêntese de "Pare(". (linha 2, coluna 7)',
      ),
    ]);
  });

  it('aponta conteúdo inesperado dentro dos parênteses', () => {
    expect(errorsOf('Andar(2);')).toEqual([
      error(
        'unexpectedToken',
        [1, 7],
        'Hmm, não esperava "2" aqui. (linha 1, coluna 7)',
      ),
    ]);
  });

  it('aponta o nome que veio sem parênteses', () => {
    expect(errorsOf('Pare;')).toEqual([
      error(
        'missingParens',
        [1, 1],
        'Faltou o "()" depois de "Pare". (linha 1, coluna 1)',
      ),
    ]);
  });

  it.each([
    ['símbolo', 'Andar(); @', '@', [1, 10]],
    ['palavra iniciada por número', '2Andar();', '2Andar', [1, 1]],
    ['";" sobrando', 'Andar();;', ';', [1, 9]],
  ] as const)('aponta caractere inesperado: %s', (_caso, source, value, at) => {
    const [line, column] = at;

    expect(errorsOf(source)).toEqual([
      error(
        'unexpectedToken',
        [line, column],
        `Hmm, não esperava "${value}" aqui. (linha ${line}, coluna ${column})`,
      ),
    ]);
  });

  it('avisa que texto entre aspas não é comando, sem repetir as aspas', () => {
    expect(errorsOf('\n"Pare();"')).toEqual([
      error(
        'unexpectedToken',
        [2, 1],
        'Hmm, textos entre aspas não são comandos. (linha 2, coluna 1)',
      ),
    ]);
  });

  it('aponta o comentário que não foi fechado e marca só o "/*"', () => {
    const result = validate('Andar();\n/* oi\nPare();');

    expect(result.calls.map((call) => call.name)).toEqual(['Andar']);
    expect(result.errors).toEqual([
      {
        code: 'unclosedComment',
        message: 'Faltou fechar o comentário com "*/". (linha 2, coluna 1)',
        start: { line: 2, column: 1 },
        end: { line: 2, column: 3 },
      },
    ]);
  });
});

describe('validateCode: entrada mista', () => {
  it('retorna as chamadas válidas e os erros, na ordem do texto', () => {
    const source = [
      'Andar();',
      'Andarr();',
      'VireEsquerda()',
      'Pare();',
      'x = ParaFrente();',
      'Pare(',
    ].join('\n');
    const result = validate(source);

    expect(result.calls.map((call) => call.name)).toEqual([
      'Andar',
      'Pare',
      'ParaFrente',
    ]);
    expect(
      result.errors.map(({ code, start }) => [code, start.line, start.column]),
    ).toEqual([
      ['unknownFunction', 2, 1],
      ['missingSemicolon', 3, 15],
      ['missingParens', 5, 1],
      ['unclosedParen', 6, 5],
    ]);
  });

  it('gera um só erro por comando quebrado', () => {
    const source = 'Andar(1, 2, 3); Pare();';

    expect(errorsOf(source)).toHaveLength(1);
    expect(callNames(source)).toEqual(['Pare']);
  });

  it('reconhece o comando seguinte na mesma linha quando falta o ";"', () => {
    expect(callNames('Andar() Pare();')).toEqual(['Pare']);
  });
});

describe('validateCode: entradas malformadas', () => {
  // Gerador com semente fixa: os casos são aleatórios, mas sempre os mesmos.
  function random(seed: number) {
    let state = seed;
    return () => {
      state = (state * 1103515245 + 12345) % 2 ** 31;
      return state / 2 ** 31;
    };
  }

  const PIECES = [
    'Andar', 'Pare', 'Andarr', 'x', '2', '(', ')', ';', ' ', '\n', '\t',
    '//', '/*', '*/', '"', "'", '\\', '@', 'ç', '😀', '\r\n', '{', '}',
  ];

  function randomSource(next: () => number) {
    const length = Math.floor(next() * 30);
    const pick = () => PIECES[Math.floor(next() * PIECES.length)];

    return Array.from({ length }, pick).join('');
  }

  it('nunca lança exceção e sempre devolve posições válidas', () => {
    const next = random(2026);

    for (let i = 0; i < 1000; i += 1) {
      const source = randomSource(next);
      const result = validate(source);

      for (const found of result.errors) {
        expect(found.start.line, source).toBeGreaterThanOrEqual(1);
        expect(found.start.column, source).toBeGreaterThanOrEqual(1);
      }
      for (const call of result.calls) {
        expect(CATALOG, source).toContain(call.name);
      }
    }
  });
});
