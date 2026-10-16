import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { TOKEN_KEY } from '../../services/api';
import { server } from '../../test/server';
import { AuthContext } from '../auth/AuthContext';
import { useFunctions } from './FunctionsContext';
import { FunctionsProvider } from './FunctionsProvider';

const authValue = {
  user: { id: 1, nome: 'Ana', email: 'ana@email.com', role: 'USER' as const },
  token: 'token-valido',
  login: () => {},
  logout: () => {},
};

function TestConsumer() {
  const { functionsByName, loading, error } = useFunctions();

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <ul>
      {Array.from(functionsByName.entries()).map(([nome, fn]) => (
        <li key={nome}>{`${nome}:${fn.id}`}</li>
      ))}
    </ul>
  );
}

function renderWithProvider() {
  localStorage.setItem(TOKEN_KEY, 'token-valido');

  return render(
    <AuthContext.Provider value={authValue}>
      <FunctionsProvider>
        <TestConsumer />
      </FunctionsProvider>
    </AuthContext.Provider>,
  );
}

describe('FunctionsContext - indexação por nome', () => {
  it('indexa o catálogo retornado pela API por nome', async () => {
    renderWithProvider();

    expect(await screen.findByText('Andar:1')).toBeInTheDocument();
    expect(screen.getByText('VireEsquerda:2')).toBeInTheDocument();
  });

  it('lança erro ao usar useFunctions fora de um FunctionsProvider', () => {
    function Lonely() {
      useFunctions();
      return null;
    }

    expect(() => render(<Lonely />)).toThrow(
      'useFunctions deve ser usado dentro de um FunctionsProvider',
    );
  });

  it('não indexa funções quando o catálogo vem vazio', async () => {
    server.use(
      http.get('http://localhost:3000/functions', () => HttpResponse.json([])),
    );

    renderWithProvider();

    const list = await screen.findByRole('list');
    expect(list).toBeEmptyDOMElement();
  });
});
