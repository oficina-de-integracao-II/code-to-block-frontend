import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { server } from '../../test/server';
import { TOKEN_KEY } from '../../services/api';
import { AuthProvider } from './AuthProvider';
import { LogoutButton } from './LogoutButton';

function renderWithSession() {
  localStorage.setItem(TOKEN_KEY, 'token-valido');

  return render(
    <MemoryRouter initialEntries={['/app']}>
      <AuthProvider>
        <Routes>
          <Route path="/app" element={<LogoutButton />} />
          <Route path="/login" element={<h1>Login</h1>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('LogoutButton', () => {
  it('chama POST /auth/logout, limpa a sessão e navega para /login', async () => {
    const user = userEvent.setup();
    renderWithSession();

    await user.click(screen.getByRole('button', { name: 'Sair' }));

    expect(
      await screen.findByRole('heading', { name: 'Login' }),
    ).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it('limpa a sessão local mesmo quando a chamada ao backend falha', async () => {
    server.use(
      http.post('http://localhost:3000/auth/logout', () => {
        return HttpResponse.json({ message: 'erro' }, { status: 500 });
      }),
    );

    const user = userEvent.setup();
    renderWithSession();

    await user.click(screen.getByRole('button', { name: 'Sair' }));

    expect(
      await screen.findByRole('heading', { name: 'Login' }),
    ).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});
