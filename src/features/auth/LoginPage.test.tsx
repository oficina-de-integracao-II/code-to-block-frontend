import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { server } from '../../test/server';
import { AuthProvider } from './AuthProvider';
import { LoginPage } from './LoginPage';

function renderLoginPage(state?: { sessionExpired?: boolean }) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/login', state }]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/app" element={<h1>App</h1>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  { email, senha }: { email: string; senha: string },
) {
  if (email) await user.type(screen.getByLabelText('E-mail'), email);
  if (senha) await user.type(screen.getByLabelText('Senha'), senha);
}

describe('LoginPage', () => {
  it('exibe o aviso de sessão expirada quando navegado com esse state', () => {
    renderLoginPage({ sessionExpired: true });

    expect(
      screen.getByText('Você ficou um tempão fora. Entre de novo!'),
    ).toBeInTheDocument();
  });

  it('não exibe o aviso de sessão expirada em acesso normal', () => {
    renderLoginPage();

    expect(
      screen.queryByText('Você ficou um tempão fora. Entre de novo!'),
    ).not.toBeInTheDocument();
  });

  it('autentica com sucesso e navega para /app', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await fillForm(user, { email: 'ana@email.com', senha: 'senha1234' });
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(
      await screen.findByRole('heading', { name: 'App' }),
    ).toBeInTheDocument();
  });

  it('exibe mensagem de erro em credenciais inválidas (401)', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await fillForm(user, { email: 'inexistente@email.com', senha: 'senha1234' });
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(
      await screen.findByRole('alert', {}, { timeout: 2000 }),
    ).toHaveTextContent('E-mail ou senha incorretos.');
  });

  it('exibe mensagem genérica em erro inesperado do servidor', async () => {
    server.use(
      http.post('http://localhost:3000/auth/login', () => {
        return HttpResponse.json({ message: 'erro interno' }, { status: 500 });
      }),
    );

    const user = userEvent.setup();
    renderLoginPage();

    await fillForm(user, { email: 'ana@email.com', senha: 'senha1234' });
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível entrar. Tente novamente.',
    );
  });
});
