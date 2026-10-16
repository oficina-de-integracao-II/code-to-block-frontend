import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { TOKEN_KEY } from '../../services/api';
import { useAuth } from './AuthContext';
import { AuthProvider } from './AuthProvider';
import type { AuthUser } from './authApi';

const USER_KEY = 'code-to-blocks-user';

const testUser: AuthUser = { id: 1, nome: 'Ana', email: 'ana@email.com', role: 'USER' };

function TestConsumer() {
  const { user, token, login, logout } = useAuth();

  return (
    <div>
      <p data-testid="token">{token ?? 'sem-token'}</p>
      <p data-testid="user">{user ? user.nome : 'sem-usuario'}</p>
      <button onClick={() => login('novo-token', testUser)}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>,
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('inicia sem sessão quando não há nada persistido', () => {
    renderWithProvider();

    expect(screen.getByTestId('token')).toHaveTextContent('sem-token');
    expect(screen.getByTestId('user')).toHaveTextContent('sem-usuario');
  });

  it('login persiste token e usuário no localStorage e atualiza o contexto', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(screen.getByTestId('token')).toHaveTextContent('novo-token');
    expect(screen.getByTestId('user')).toHaveTextContent('Ana');
    expect(localStorage.getItem(TOKEN_KEY)).toBe('novo-token');
    expect(JSON.parse(localStorage.getItem(USER_KEY)!)).toEqual(testUser);
  });

  it('restaura a sessão do localStorage ao montar', () => {
    localStorage.setItem(TOKEN_KEY, 'token-existente');
    localStorage.setItem(USER_KEY, JSON.stringify(testUser));

    renderWithProvider();

    expect(screen.getByTestId('token')).toHaveTextContent('token-existente');
    expect(screen.getByTestId('user')).toHaveTextContent('Ana');
  });

  it('logout limpa o contexto e o localStorage', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByRole('button', { name: 'Login' }));
    await user.click(screen.getByRole('button', { name: 'Logout' }));

    expect(screen.getByTestId('token')).toHaveTextContent('sem-token');
    expect(screen.getByTestId('user')).toHaveTextContent('sem-usuario');
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(USER_KEY)).toBeNull();
  });

  it('limpa a sessão quando recebe o evento auth:unauthorized', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByRole('button', { name: 'Login' }));
    expect(screen.getByTestId('token')).toHaveTextContent('novo-token');

    act(() => {
      window.dispatchEvent(new Event('auth:unauthorized'));
    });

    expect(screen.getByTestId('token')).toHaveTextContent('sem-token');
    expect(screen.getByTestId('user')).toHaveTextContent('sem-usuario');
  });

  it('ignora usuário persistido com JSON inválido', () => {
    localStorage.setItem(TOKEN_KEY, 'token-existente');
    localStorage.setItem(USER_KEY, '{json-invalido');

    renderWithProvider();

    expect(screen.getByTestId('user')).toHaveTextContent('sem-usuario');
  });

  it('lança erro ao usar useAuth fora de um AuthProvider', () => {
    expect(() => render(<TestConsumer />)).toThrow(
      'useAuth deve ser usado dentro de um AuthProvider',
    );
  });
});
