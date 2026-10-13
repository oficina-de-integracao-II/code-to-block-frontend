import { http, HttpResponse } from 'msw';

export const handlers = [
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