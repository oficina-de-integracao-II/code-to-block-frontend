import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { server } from '../../test/server';
import { AuthProvider } from './AuthProvider';
import { LoginPage } from './LoginPage';

vi.mock('./loadGoogleScript', () => ({
  loadGoogleScript: vi.fn().mockResolvedValue(undefined),
}));

function mockGoogleSdk() {
  const initialize = vi.fn();

  window.google = {
    accounts: { id: { initialize, renderButton: vi.fn(), prompt: vi.fn() } },
  };

  return {
    triggerCredential: (credential: string) => {
      const { callback } = initialize.mock.calls[0][0];
      callback({ credential });
    },
  };
}

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
  afterEach(() => {
    delete window.google;
    vi.unstubAllEnvs();
  });

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
      await screen.findByText('E-mail ou senha incorretos.', {}, { timeout: 2000 }),
    ).toBeInTheDocument();
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

    expect(
      await screen.findByText('Não foi possível entrar. Tente novamente.'),
    ).toBeInTheDocument();
  });

  it('autentica com Google e navega para /app', async () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'client-id-teste');
    const google = mockGoogleSdk();
    renderLoginPage();

    await waitFor(() => expect(window.google!.accounts.id.initialize).toHaveBeenCalled());
    google.triggerCredential('id-token-valido');

    expect(
      await screen.findByRole('heading', { name: 'App' }),
    ).toBeInTheDocument();
  });

  it('exibe mensagem de erro quando o login com Google falha, sem quebrar a tela', async () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'client-id-teste');
    const google = mockGoogleSdk();
    renderLoginPage();

    await waitFor(() => expect(window.google!.accounts.id.initialize).toHaveBeenCalled());
    google.triggerCredential('id-token-invalido');

    expect(
      await screen.findByText(
        'Não deu para entrar com o Google. Tente de novo ou use e-mail e senha.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('exibe mensagem de erro quando o usuário cancela/fecha o seletor do Google', () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '');
    renderLoginPage();

    expect(
      screen.getByText(
        'Não deu para entrar com o Google. Tente de novo ou use e-mail e senha.',
      ),
    ).toBeInTheDocument();
  });
});
