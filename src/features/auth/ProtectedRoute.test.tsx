import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { TOKEN_KEY } from '../../services/api';
import { AuthProvider } from './AuthProvider';
import { ProtectedRoute } from './ProtectedRoute';

function renderWithRoute(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<h1>Login</h1>} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <h1>App protegido</h1>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  afterEach(() => localStorage.clear());

  it('redireciona para /login quando não há sessão', () => {
    renderWithRoute('/app');

    expect(
      screen.getByRole('heading', { name: 'Login' }),
    ).toBeInTheDocument();
  });

  it('renderiza o conteúdo protegido quando há sessão', () => {
    localStorage.setItem(TOKEN_KEY, 'token-valido');

    renderWithRoute('/app');

    expect(
      screen.getByRole('heading', { name: 'App protegido' }),
    ).toBeInTheDocument();
  });
});
