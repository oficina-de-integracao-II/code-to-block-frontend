import { fireEvent, render, screen, within } from '@testing-library/react';
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
  makeFunction(9, 'ParaTras', 'Move o robô para trás.'),
  makeFunction(2, 'VireEsquerda', 'Gira o robô 90° para a esquerda.'),
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

    expect(
      screen.getByRole('status', { name: 'Carregando funções' }),
    ).toBeInTheDocument();
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

  function openDetail(nome: string) {
    const trigger = screen.getByRole('button', { name: `Ver detalhes de ${nome}` });
    trigger.focus();
    fireEvent.click(trigger);

    return trigger;
  }

  it('selecionar uma função exibe seu código e descrição', async () => {
    renderPanel();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    openDetail('VireEsquerda');

    const detail = screen.getByRole('dialog', { name: 'VireEsquerda' });

    expect(within(detail).getByText('Gira o robô 90° para a esquerda.')).toBeInTheDocument();
    expect(within(detail).getByLabelText('Código Arduino (somente leitura)')).toBeInTheDocument();
    expect(await within(detail).findByText('Nenhum — é só chamar e pronto!')).toBeInTheDocument();
  });

  it.each([
    ['botão Fechar', () => fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))],
    ['botão Voltar', () => fireEvent.click(screen.getByRole('button', { name: 'Voltar' }))],
    ['tecla Esc', () => fireEvent.keyDown(document, { key: 'Escape' })],
    ['clique fora', () => fireEvent.click(screen.getByTestId('detail-backdrop'))],
  ])('fechar a gaveta (%s) remove o detalhe e devolve o foco', (_, close) => {
    renderPanel();
    const trigger = openDetail('VireEsquerda');

    close();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
