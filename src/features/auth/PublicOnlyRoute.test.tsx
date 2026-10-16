import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { TOKEN_KEY } from '../../services/api';
import { AuthProvider } from './AuthProvider';
import { PublicOnlyRoute } from './PublicOnlyRoute';

function renderWithRoute() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <h1>Login</h1>
              </PublicOnlyRoute>
            }
          />
          <Route path="/app" element={<h1>App</h1>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('PublicOnlyRoute', () => {
  afterEach(() => localStorage.clear());

  it('renderiza o conteúdo quando não há sessão', () => {
    renderWithRoute();

    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
  });

  it('redireciona para /app quando o usuário já está autenticado', () => {
    localStorage.setItem(TOKEN_KEY, 'token-valido');

    renderWithRoute();

    expect(screen.getByRole('heading', { name: 'App' })).toBeInTheDocument();
  });
});
