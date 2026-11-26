// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { suggestName } from './suggestName';

const CATALOG = [
  'Andar',
  'ParaFrente',
  'ParaTras',
  'VireEsquerda',
  'VireDireita',
  'Pare',
];

describe('suggestName', () => {
  it.each([
    ['letra sobrando', 'Andarr', 'Andar'],
    ['letra faltando', 'VireDirita', 'VireDireita'],
    ['letra trocada', 'Parw', 'Pare'],
    ['maiúsculas diferentes', 'paratras', 'ParaTras'],
  ])('sugere o nome com %s', (_caso, typed, expected) => {
    expect(suggestName(typed, CATALOG)).toBe(expected);
  });

  it.each([
    ['Andarzzz', 'mais de uma letra errada a cada três'],
    ['Vire', 'metade do nome trocada'],
  ])('não sugere para "%s" (%s)', (typed) => {
    expect(suggestName(typed, CATALOG)).toBeUndefined();
  });

  it('não transforma um nome curto demais em outro', () => {
    expect(suggestName('x', ['y'])).toBeUndefined();
  });

  it('desempata pelo primeiro nome do catálogo', () => {
    expect(suggestName('Par', ['Pare', 'Para'])).toBe('Pare');
  });

  it('não sugere nada com o catálogo vazio', () => {
    expect(suggestName('Andar', [])).toBeUndefined();
  });
});
