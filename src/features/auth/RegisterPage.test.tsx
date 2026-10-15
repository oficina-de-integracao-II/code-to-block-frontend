import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse, delay } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { server } from '../../test/server';
import { RegisterPage } from './RegisterPage';

function renderRegisterPage() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<h1>Login</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  { email, senha, confirmarSenha }: { email: string; senha: string; confirmarSenha: string },
) {
  await user.type(screen.getByLabelText('E-mail'), email);
  await user.type(screen.getByLabelText('Senha (mín. 8 caracteres)'), senha);
  await user.type(screen.getByLabelText('Confirmar senha'), confirmarSenha);
}

describe('RegisterPage', () => {
  it('cadastra com sucesso e redireciona para o login', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    await fillForm(user, {
      email: 'ana@email.com',
      senha: 'senha1234',
      confirmarSenha: 'senha1234',
    });
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(
      await screen.findByRole('heading', { name: 'Login' }),
    ).toBeInTheDocument();
  });

  it('desabilita o botão durante o envio', async () => {
    server.use(
      http.post('http://localhost:3000/auth/register', async () => {
        await delay(50);
        return HttpResponse.json({ id: '1', email: 'ana@email.com' }, { status: 201 });
      }),
    );

    const user = userEvent.setup();
    renderRegisterPage();

    await fillForm(user, {
      email: 'ana@email.com',
      senha: 'senha1234',
      confirmarSenha: 'senha1234',
    });

    const button = screen.getByRole('button', { name: 'Criar conta' });
    await user.click(button);

    expect(
      screen.getByRole('button', { name: 'Criando conta…' }),
    ).toBeDisabled();

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument(),
    );
  });

  it('exibe mensagem de e-mail já cadastrado em erro 409', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    await fillForm(user, {
      email: 'duplicado@email.com',
      senha: 'senha1234',
      confirmarSenha: 'senha1234',
    });
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(
      await screen.findByRole('alert', {}, { timeout: 2000 }),
    ).toHaveTextContent('Este e-mail já está cadastrado.');
  });

  it('exibe mensagem genérica em erro inesperado do servidor', async () => {
    server.use(
      http.post('http://localhost:3000/auth/register', () => {
        return HttpResponse.json({ message: 'erro interno' }, { status: 500 });
      }),
    );

    const user = userEvent.setup();
    renderRegisterPage();

    await fillForm(user, {
      email: 'ana@email.com',
      senha: 'senha1234',
      confirmarSenha: 'senha1234',
    });
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível criar a conta. Tente novamente.',
    );
  });

  it('valida e-mail inválido, senha curta e confirmação divergente', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    await fillForm(user, {
      email: 'email-invalido',
      senha: '123',
      confirmarSenha: '456',
    });
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(
      screen.getByText('Informe um e-mail válido.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('A senha deve ter no mínimo 8 caracteres.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('As senhas não coincidem.'),
    ).toBeInTheDocument();
  });

  it('associa campos e mensagens de erro por label/aria-describedby', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    const emailField = screen.getByLabelText('E-mail');
    const errorMessage = screen.getByText('Informe um e-mail válido.');

    expect(emailField).toHaveAttribute('aria-invalid', 'true');
    expect(emailField).toHaveAttribute('aria-describedby', errorMessage.id);
  });
});
