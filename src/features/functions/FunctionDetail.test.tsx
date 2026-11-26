import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/server';
import { FunctionDetail } from './FunctionDetail';
import type { FunctionSummary } from './functionsApi';

const andar: FunctionSummary = {
  id: 1,
  nome: 'Andar',
  descricao: 'Move o robô para frente.',
  codigoArduino: '\n      void Andar() {\n        analogWrite(5, 128);\n      }',
  blocoDefinicao: { type: 'andar', message0: 'Andar' },
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('FunctionDetail', () => {
  it('exibe descrição, código e parâmetros da função selecionada', async () => {
    render(<FunctionDetail fn={andar} onClose={() => {}} />);

    expect(screen.getByText('Move o robô para frente.')).toBeInTheDocument();
    expect(screen.getByLabelText('Código Arduino (somente leitura)')).toHaveTextContent(
      'void Andar() {',
    );
    expect(screen.getByLabelText('Código Arduino (somente leitura)')).toHaveTextContent(
      'analogWrite(5, 128);',
    );

    expect(await screen.findByText('velocidade')).toBeInTheDocument();
    expect(screen.getByRole('listitem')).toHaveTextContent('velocidade — 128');
  });

  it('não permite editar o código', () => {
    const { container } = render(<FunctionDetail fn={andar} onClose={() => {}} />);

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(container.querySelector('textarea, input')).toBeNull();
    expect(container.querySelector('[contenteditable="true"]')).toBeNull();
  });

  it('copia o código para a área de transferência', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    render(<FunctionDetail fn={andar} onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Copiar código' }));

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith('void Andar() {\n  analogWrite(5, 128);\n}'),
    );
    expect(await screen.findByRole('button', { name: 'Copiou!' })).toBeInTheDocument();
  });

  it('avisa quando a cópia falha', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockRejectedValue(new Error('negado')) },
      configurable: true,
    });

    render(<FunctionDetail fn={andar} onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Copiar código' }));

    expect(await screen.findByText('Não foi possível copiar o código.')).toBeInTheDocument();
  });

  it('indica função sem parâmetros', async () => {
    render(<FunctionDetail fn={{ ...andar, id: 2, nome: 'VireEsquerda' }} onClose={() => {}} />);

    expect(await screen.findByText('Nenhum — é só chamar e pronto!')).toBeInTheDocument();
  });

  it('exibe erro quando os parâmetros não carregam, mantendo código e descrição', async () => {
    server.use(
      http.get('http://localhost:3000/functions/:id', () =>
        HttpResponse.json({ message: 'erro' }, { status: 500 }),
      ),
    );

    render(<FunctionDetail fn={andar} onClose={() => {}} />);

    expect(await screen.findByText('Não foi possível carregar os parâmetros.')).toBeInTheDocument();
    expect(screen.getByText('Move o robô para frente.')).toBeInTheDocument();
  });

  it('também aceita parâmetros em formato de array', async () => {
    server.use(
      http.get('http://localhost:3000/functions/:id', () =>
        HttpResponse.json({
          ...andar,
          parametros: [{ nome: 'pino', tipo: 'int', descricao: 'Pino do motor.' }],
        }),
      ),
    );

    render(<FunctionDetail fn={andar} onClose={() => {}} />);

    expect(await screen.findByText('pino')).toBeInTheDocument();
    expect(screen.getByRole('listitem')).toHaveTextContent('pino (int) — Pino do motor.');
  });

  it('avisa quando a área de transferência não está disponível', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true,
    });

    render(<FunctionDetail fn={andar} onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Copiar código' }));

    expect(await screen.findByText('Não foi possível copiar o código.')).toBeInTheDocument();
  });

  it('volta o rótulo do botão 2s depois da última cópia', async () => {
    vi.useFakeTimers();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });

    render(<FunctionDetail fn={andar} onClose={() => {}} />);
    const button = screen.getByRole('button', { name: 'Copiar código' });

    await act(async () => {
      fireEvent.click(button);
    });
    act(() => vi.advanceTimersByTime(1500));
    await act(async () => {
      fireEvent.click(button);
    });
    act(() => vi.advanceTimersByTime(1500));

    expect(button).toHaveTextContent('Copiou!');

    act(() => vi.advanceTimersByTime(500));

    expect(button).toHaveTextContent('Copiar código');
    vi.useRealTimers();
  });

  it('foca o título ao abrir e mantém o Tab dentro da gaveta', () => {
    render(<FunctionDetail fn={andar} onClose={() => {}} />);

    expect(screen.getByRole('heading', { name: 'Andar' })).toHaveFocus();

    const back = screen.getByRole('button', { name: 'Voltar' });
    const copy = screen.getByRole('button', { name: 'Copiar código' });

    copy.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(back).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(copy).toHaveFocus();
  });
});
