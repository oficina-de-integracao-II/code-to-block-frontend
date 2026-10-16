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

function StatusConsumer() {
  const { loading, error, functions } = useFunctions();

  if (loading) return <p>Carregando catálogo...</p>;
  if (error) return <p role="alert">{error}</p>;

  return (
    <ul>
      {functions.map((fn) => (
        <li key={fn.id}>{fn.nome}</li>
      ))}
    </ul>
  );
}

function renderWithSession() {
  localStorage.setItem(TOKEN_KEY, 'token-valido');

  return render(
    <AuthContext.Provider value={authValue}>
      <FunctionsProvider>
        <StatusConsumer />
      </FunctionsProvider>
    </AuthContext.Provider>,
  );
}

describe('FunctionsProvider', () => {
  it('exibe o estado de carregamento enquanto busca o catálogo', () => {
    renderWithSession();

    expect(screen.getByText('Carregando catálogo...')).toBeInTheDocument();
  });

  it('carrega o catálogo com sucesso a partir de GET /functions', async () => {
    renderWithSession();

    expect(await screen.findByText('Andar')).toBeInTheDocument();
    expect(screen.getByText('VireEsquerda')).toBeInTheDocument();
  });

  it('exibe mensagem de erro quando a API falha', async () => {
    server.use(
      http.get('http://localhost:3000/functions', () => {
        return HttpResponse.json({ message: 'erro interno' }, { status: 500 });
      }),
    );

    renderWithSession();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar as funções.',
    );
  });

  it('não carrega o catálogo quando não há sessão ativa', () => {
    render(
      <AuthContext.Provider value={{ ...authValue, token: null }}>
        <FunctionsProvider>
          <StatusConsumer />
        </FunctionsProvider>
      </AuthContext.Provider>,
    );

    expect(screen.queryByText('Carregando catálogo...')).not.toBeInTheDocument();
    expect(screen.queryByText('Andar')).not.toBeInTheDocument();
  });
});
