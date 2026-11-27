import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EditorErrorBoundary } from './EditorErrorBoundary';

function BrokenEditor(): never {
  throw new Error('Falha ao baixar o editor');
}

describe('EditorErrorBoundary', () => {
  it('renderiza o editor quando não há erro', () => {
    render(
      <EditorErrorBoundary>
        <p>Editor</p>
      </EditorErrorBoundary>,
    );

    expect(screen.getByText('Editor')).toBeInTheDocument();
  });

  it('mostra um aviso com opção de recarregar quando o editor falha', () => {
    // O React registra o erro capturado no console; silencia nos testes.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <EditorErrorBoundary>
        <BrokenEditor />
      </EditorErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar o editor.');
    expect(screen.getByRole('button', { name: 'Recarregar página' })).toBeInTheDocument();

    consoleError.mockRestore();
  });
});
