import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('http://localhost:3000/auth/register', async ({ request }) => {
    const body = (await request.json()) as { email: string; senha: string };

    if (body.email === 'duplicado@email.com') {
      return HttpResponse.json(
        { message: 'E-mail já cadastrado.' },
        { status: 409 },
      );
    }

    return HttpResponse.json(
      { id: '1', email: body.email },
      { status: 201 },
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