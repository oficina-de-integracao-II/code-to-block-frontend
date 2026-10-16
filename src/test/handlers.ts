import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('http://localhost:3000/auth/register', async ({ request }) => {
    const body = (await request.json()) as { nome: string; email: string; senha: string };

    if (body.email === 'duplicado@email.com') {
      return HttpResponse.json(
        { message: 'E-mail já cadastrado.' },
        { status: 409 },
      );
    }

    return HttpResponse.json(
      {
        accessToken: 'token-teste',
        user: { id: 1, nome: body.nome, email: body.email, role: 'USER' },
      },
      { status: 201 },
    );
  }),

  http.post('http://localhost:3000/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; senha: string };

    if (body.email === 'inexistente@email.com' || body.senha === 'senha-errada') {
      return HttpResponse.json(
        { message: 'E-mail ou senha incorretos.' },
        { status: 401 },
      );
    }

    return HttpResponse.json(
      {
        accessToken: 'token-teste',
        user: { id: 1, nome: 'Ana', email: body.email, role: 'USER' },
      },
      { status: 200 },
    );
  }),

  http.post('http://localhost:3000/auth/google', async ({ request }) => {
    const body = (await request.json()) as { idToken: string };

    if (body.idToken !== 'id-token-valido') {
      return HttpResponse.json(
        { message: 'Token do Google inválido' },
        { status: 401 },
      );
    }

    return HttpResponse.json(
      {
        accessToken: 'token-teste',
        user: { id: 1, nome: 'Ana', email: 'ana@gmail.com', role: 'USER' },
      },
      { status: 200 },
    );
  }),

  http.get('http://localhost:3000/api/blocks', () => {
    return HttpResponse.json({
      blocks: [
        {
          id: 'move-forward',
          name: 'Mover para frente',
          category: 'movement',
        },
        {
          id: 'turn-right',
          name: 'Virar à direita',
          category: 'movement',
        },
      ],
    });
  }),
];