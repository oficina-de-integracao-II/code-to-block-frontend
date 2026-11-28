// @vitest-environment node
import { describe, expect, it } from 'vitest';
import type { FunctionSummary } from '../functions/functionsApi';
import { suggestFunctions } from './suggestFunctions';

function fn(nome: string, descricao = `Descrição de ${nome}.`): FunctionSummary {
  return {
    id: 0,
    nome,
    descricao,
    codigoArduino: '',
    blocoDefinicao: { type: nome, message0: nome },
  };
}

const CATALOG = [
  fn('Andar'),
  fn('VireEsquerda', 'Gira o robô 90° para a esquerda.'),
  fn('VireDireita', 'Gira o robô 90° para a direita.'),
  fn('Pare'),
];

const names = (typed: string) => suggestFunctions(CATALOG, typed).map((item) => item.name);

describe('suggestFunctions', () => {
  it('sugere as funções que começam pelo texto digitado, na ordem do catálogo', () => {
    expect(names('Vire')).toEqual(['VireEsquerda', 'VireDireita']);
  });

  it('ignora maiúsculas e minúsculas', () => {
    expect(names('vire')).toEqual(['VireEsquerda', 'VireDireita']);
    expect(names('PA')).toEqual(['Pare']);
  });

  it('não sugere funções que só contêm o texto no meio do nome', () => {
    expect(names('Direita')).toEqual([]);
  });

  it('sugere todas as funções quando nada foi digitado', () => {
    expect(names('')).toEqual(['Andar', 'VireEsquerda', 'VireDireita', 'Pare']);
  });

  it('não sugere nada com o catálogo vazio', () => {
    expect(suggestFunctions([], 'An')).toEqual([]);
  });

  it('traz a descrição e o texto "Nome();" de cada função', () => {
    expect(suggestFunctions(CATALOG, 'VireE')).toEqual([
      {
        name: 'VireEsquerda',
        description: 'Gira o robô 90° para a esquerda.',
        insertText: 'VireEsquerda();',
      },
    ]);
  });
});
