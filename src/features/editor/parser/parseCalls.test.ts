// @vitest-environment node
// Roda sem jsdom para garantir que o parser não depende do DOM.
import { describe, expect, it } from 'vitest';
import { parseCalls } from './index';
import type { FunctionCallNode } from './index';

const names = (source: string) => parseCalls(source).map((call) => call.name);

/** Monta um nó esperado a partir de `[linha, coluna]` de início e de fim. */
function node(
  name: string,
  [startLine, startColumn]: [number, number],
  [endLine, endColumn]: [number, number],
): FunctionCallNode {
  return {
    type: 'FunctionCall',
    name,
    start: { line: startLine, column: startColumn },
    end: { line: endLine, column: endColumn },
  };
}

describe('parseCalls: reconhecimento de chamadas', () => {
  it('reconhece uma chamada', () => {
    expect(parseCalls('Andar();')).toEqual([node('Andar', [1, 1], [1, 9])]);
  });

  it('reconhece várias chamadas na ordem do texto, inclusive repetidas', () => {
    expect(names('Andar(); VireEsquerda();\nPare();Andar();')).toEqual([
      'Andar',
      'VireEsquerda',
      'Pare',
      'Andar',
    ]);
  });

  it.each(['_iniciar', 'Motor2', 'para_frente', 'Avançar', 'Função'])(
    'aceita o nome %s por inteiro',
    (name) => {
      expect(names(`${name}();`)).toEqual([name]);
    },
  );

  it('aceita nomes que não existem em nenhum catálogo', () => {
    expect(names('QualquerCoisa();')).toEqual(['QualquerCoisa']);
  });

  it('retorna o mesmo resultado quando chamada de novo', () => {
    const source = 'Andar();\nPare();';

    expect(parseCalls(source)).toEqual(parseCalls(source));
  });
});

describe('parseCalls: texto sem chamadas', () => {
  it.each([
    ['vazio', ''],
    ['só com espaços', '   \t  '],
    ['só com quebras de linha', '\n\r\n\r'],
    ['só com comentários', '// um\n/* dois\n três */'],
  ])('retorna lista vazia para texto %s', (_label, source) => {
    expect(parseCalls(source)).toEqual([]);
  });
});

describe('parseCalls: espaços e quebras de linha', () => {
  it('ignora espaços e tabs extras entre os elementos', () => {
    expect(names('  \t Andar  (\t)   ;   Pare ( ) ;  ')).toEqual([
      'Andar',
      'Pare',
    ]);
  });

  it('ignora quebras de linha no meio de uma chamada', () => {
    expect(names('Andar\n(\r\n)\r;')).toEqual(['Andar']);
  });

  it('ignora espaços Unicode e BOM', () => {
    expect(names('﻿Andar ();')).toEqual(['Andar']);
  });
});

describe('parseCalls: comentários', () => {
  it('ignora chamada em comentário de linha', () => {
    expect(names('// Pare();\nAndar(); // VireDireita();')).toEqual(['Andar']);
  });

  it('ignora chamadas em comentário de bloco com várias linhas', () => {
    expect(names('/*\nPare();\nPare();\n*/\nAndar();')).toEqual(['Andar']);
  });

  it('aceita comentários entre os elementos de uma chamada', () => {
    expect(names('Andar/* a */(/* b */) // c\n;')).toEqual(['Andar']);
  });

  it('encerra o comentário de bloco no primeiro */', () => {
    expect(names('/* /* Pare(); */ Andar(); /**/ VireDireita();')).toEqual([
      'Andar',
      'VireDireita',
    ]);
  });

  it('trata */ dentro de comentário de linha como texto comum', () => {
    expect(names('// */ Pare();\nAndar();')).toEqual(['Andar']);
  });

  it('não abre comentário de bloco dentro de comentário de linha', () => {
    expect(names('// /*\nAndar();')).toEqual(['Andar']);
  });

  it('ignora o resto do texto após um comentário de bloco não fechado', () => {
    expect(names('Andar(); /* Pare();\nVireDireita();')).toEqual(['Andar']);
  });
});

describe('parseCalls: trechos fora do formato', () => {
  it.each([
    ['sem ponto e vírgula', 'Andar()'],
    ['sem parênteses', 'Andar;'],
    ['sem fechar parêntese', 'Andar(;'],
    ['sem abrir parêntese', 'Andar);'],
    ['sem nome', '();'],
    ['com argumento', 'Andar(10);'],
    ['com nome iniciado por número', '2Andar();'],
    ['com um só caractere de comentário', 'Andar() / ;'],
  ])('ignora chamada %s', (_label, source) => {
    expect(parseCalls(source)).toEqual([]);
  });

  it('continua reconhecendo as chamadas depois de um trecho inválido', () => {
    expect(names('Andar()\nPare(;\n@ # VireDireita();')).toEqual([
      'VireDireita',
    ]);
  });

  it('não reconhece chamada dentro de texto ou caractere literal', () => {
    expect(names('"Pare();" \'x\' "a \\" Pare();" Andar();')).toEqual(['Andar']);
  });

  it('não trata // dentro de texto literal como comentário', () => {
    expect(names('"http://x" Andar();')).toEqual(['Andar']);
  });

  it('limita à própria linha um texto literal não fechado', () => {
    expect(names('"Pare();\nAndar();')).toEqual(['Andar']);
  });

  it.each(['((((', '*/', '/', '"', "'", '\\', '🤖', '\u0000'])(
    'não lança exceção para a entrada %j',
    (source) => {
      expect(() => parseCalls(source)).not.toThrow();
    },
  );
});

describe('parseCalls: posições', () => {
  it('calcula linha e coluna em entrada multilinha', () => {
    const source = ['Andar();', '', '  VireEsquerda(); Pare();', '\tAndar();'];

    expect(parseCalls(source.join('\n'))).toEqual([
      node('Andar', [1, 1], [1, 9]),
      node('VireEsquerda', [3, 3], [3, 18]),
      node('Pare', [3, 19], [3, 26]),
      node('Andar', [4, 2], [4, 10]),
    ]);
  });

  it.each([
    ['LF', '\n'],
    ['CRLF', '\r\n'],
    ['CR', '\r'],
  ])('conta cada quebra %s como uma linha', (_label, lineBreak) => {
    const source = ['Andar();', '', 'Pare();'].join(lineBreak);

    expect(parseCalls(source)).toEqual([
      node('Andar', [1, 1], [1, 9]),
      node('Pare', [3, 1], [3, 8]),
    ]);
  });

  it('marca início e fim de chamada quebrada em várias linhas', () => {
    expect(parseCalls('  Andar\n  (\n  )\n    ;')).toEqual([
      node('Andar', [1, 3], [4, 6]),
    ]);
  });

  it('mantém a contagem após comentários de linha e de bloco', () => {
    const source = '// título\n/* a\nb\n c */ Andar(); // fim\n  Pare();';

    expect(parseCalls(source)).toEqual([
      node('Andar', [4, 7], [4, 15]),
      node('Pare', [5, 3], [5, 10]),
    ]);
  });

  it('conta colunas em unidades UTF-16, como o Monaco', () => {
    expect(parseCalls('/* 🤖 */Andar();')).toEqual([
      node('Andar', [1, 9], [1, 17]),
    ]);
  });
});
