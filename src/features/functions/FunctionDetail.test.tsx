import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
    render(<FunctionDetail fn={andar} />);

    expect(screen.getByText('Move o robô para frente.')).toBeInTheDocument();
    expect(screen.getByLabelText('Código Arduino (somente leitura)')).toHaveTextContent(
      'void Andar() {',
    );
    expect(screen.getByLabelText('Código Arduino (somente leitura)')).toHaveTextContent(
      'analogWrite(5, 128);',
    );

    expect(await screen.findByText('velocidade')).toBeInTheDocument();
    expect(screen.getByText(/Velocidade de 0 a 255/)).toBeInTheDocument();
  });

  it('não permite editar o código', () => {
    const { container } = render(<FunctionDetail fn={andar} />);

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

    render(<FunctionDetail fn={andar} />);
    fireEvent.click(screen.getByRole('button', { name: 'Copiar código' }));

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith('void Andar() {\n  analogWrite(5, 128);\n}'),
    );
    expect(await screen.findByRole('button', { name: 'Copiado!' })).toBeInTheDocument();
  });

  it('avisa quando a cópia falha', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockRejectedValue(new Error('negado')) },
      configurable: true,
    });

    render(<FunctionDetail fn={andar} />);
    fireEvent.click(screen.getByRole('button', { name: 'Copiar código' }));

    expect(await screen.findByText('Não foi possível copiar o código.')).toBeInTheDocument();
  });

  it('indica função sem parâmetros', async () => {
    render(<FunctionDetail fn={{ ...andar, id: 2, nome: 'VireEsquerda' }} />);

    expect(await screen.findByText('Esta função não recebe parâmetros.')).toBeInTheDocument();
  });

  it('exibe erro quando os parâmetros não carregam, mantendo código e descrição', async () => {
    server.use(
      http.get('http://localhost:3000/functions/:id', () =>
        HttpResponse.json({ message: 'erro' }, { status: 500 }),
      ),
    );

    render(<FunctionDetail fn={andar} />);

    expect(await screen.findByText('Não foi possível carregar os parâmetros.')).toBeInTheDocument();
    expect(screen.getByText('Move o robô para frente.')).toBeInTheDocument();
  });
});
