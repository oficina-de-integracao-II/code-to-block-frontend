import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FunctionsContext, type FunctionsContextValue } from './FunctionsContext';
import type { FunctionSummary } from './functionsApi';
import { FunctionsPanel } from './FunctionsPanel';

function makeFunction(id: number, nome: string, descricao: string): FunctionSummary {
  return {
    id,
    nome,
    descricao,
    codigoArduino: '',
    blocoDefinicao: { type: nome.toLowerCase(), message0: nome },
  };
}

const catalog = [
  makeFunction(1, 'Andar', 'Move o robô para frente.'),
  makeFunction(2, 'ParaTras', 'Move o robô para trás.'),
  makeFunction(3, 'VireEsquerda', 'Gira o robô 90° para a esquerda.'),
];

function renderPanel(overrides: Partial<FunctionsContextValue> = {}) {
  const value: FunctionsContextValue = {
    functions: catalog,
    functionsByName: new Map(catalog.map((fn) => [fn.nome, fn])),
    loading: false,
    error: null,
    reload: vi.fn(),
    ...overrides,
  };

  render(
    <FunctionsContext.Provider value={value}>
      <FunctionsPanel />
    </FunctionsContext.Provider>,
  );

  return value;
}

describe('FunctionsPanel', () => {
  it('lista nome e descrição de cada função do catálogo', () => {
    renderPanel();

    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText('Andar')).toBeInTheDocument();
    expect(screen.getByText('Move o robô para frente.')).toBeInTheDocument();
    expect(screen.getByText('VireEsquerda')).toBeInTheDocument();
  });

  it('o filtro reduz os itens pelo nome, ignorando caixa e acentos', () => {
    renderPanel();

    fireEvent.change(screen.getByLabelText('Buscar função'), {
      target: { value: 'vire' },
    });

    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText('VireEsquerda')).toBeInTheDocument();
    expect(screen.queryByText('Andar')).not.toBeInTheDocument();
  });

  it('exibe mensagem quando o filtro não encontra nada', () => {
    renderPanel();

    fireEvent.change(screen.getByLabelText('Buscar função'), {
      target: { value: 'xyz' },
    });

    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    expect(screen.getByText(/Nenhuma função encontrada/)).toBeInTheDocument();
  });

  it('exibe estado vazio quando o catálogo não tem funções', () => {
    renderPanel({ functions: [], functionsByName: new Map() });

    expect(screen.getByText('Nenhuma função disponível.')).toBeInTheDocument();
  });

  it('exibe estado de carregamento', () => {
    renderPanel({ loading: true, functions: [] });

    expect(screen.getByText('Carregando funções...')).toBeInTheDocument();
  });

  it('exibe erro e permite tentar novamente', () => {
    const value = renderPanel({
      functions: [],
      error: 'Não foi possível carregar as funções.',
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível carregar as funções.',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(value.reload).toHaveBeenCalledTimes(1);
  });
});
