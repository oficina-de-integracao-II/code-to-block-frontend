import { describe, expect, it } from 'vitest';
import { normalizeParameters } from './normalizeParameters';

describe('normalizeParameters', () => {
  it('trata ausência de parâmetros como lista vazia', () => {
    expect(normalizeParameters(undefined)).toEqual([]);
    expect(normalizeParameters(null)).toEqual([]);
    expect(normalizeParameters('')).toEqual([]);
    expect(normalizeParameters({})).toEqual([]);
    expect(normalizeParameters([])).toEqual([]);
  });

  it('converte objeto em um parâmetro por chave', () => {
    expect(normalizeParameters({ pino: 13, faixa: { max: 255 } })).toEqual([
      { nome: 'pino', descricao: '13' },
      { nome: 'faixa', descricao: '{"max":255}' },
    ]);
  });

  it('aceita array de objetos, valores soltos e nulos', () => {
    expect(
      normalizeParameters([{ nome: 'velocidade', tipo: 'int' }, 'pino', null]),
    ).toEqual([
      { nome: 'velocidade', tipo: 'int', descricao: undefined },
      { nome: 'pino' },
      { nome: 'param3' },
    ]);
  });

  it('aceita valor escalar', () => {
    expect(normalizeParameters(13)).toEqual([{ nome: '13' }]);
    expect(normalizeParameters(false)).toEqual([{ nome: 'false' }]);
  });
});
