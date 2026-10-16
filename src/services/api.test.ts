import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, TOKEN_KEY } from './api';

describe('API interceptors', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('injeta o token no cabeçalho Authorization', async () => {
    localStorage.setItem(TOKEN_KEY, 'token-de-teste');

    const response = await api.get('/test', {
      adapter: async (config: InternalAxiosRequestConfig) => ({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      }),
    });

    expect(response.config.headers.get('Authorization'))
      .toBe('Bearer token-de-teste');
  });

  it('remove o token da sessão quando recebe 401', async () => {
    localStorage.setItem(TOKEN_KEY, 'token-expirado');

    await expect(
      api.get('/test', {
        adapter: async (config: InternalAxiosRequestConfig) => {
          throw new AxiosError(
            'Unauthorized',
            'ERR_BAD_REQUEST',
            config,
            undefined,
            {
              data: {},
              status: 401,
              statusText: 'Unauthorized',
              headers: {},
              config,
            },
          );
        },
      }),
    ).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it('não dispara auth:unauthorized para 401 em /auth/login (credenciais inválidas)', async () => {
    localStorage.setItem(TOKEN_KEY, 'token-de-sessao-ativa');
    const handler = vi.fn();
    window.addEventListener('auth:unauthorized', handler);

    await expect(
      api.post('/auth/login', { email: 'a@a.com', senha: 'errada' }, {
        adapter: async (config: InternalAxiosRequestConfig) => {
          throw new AxiosError(
            'Unauthorized',
            'ERR_BAD_REQUEST',
            config,
            undefined,
            {
              data: {},
              status: 401,
              statusText: 'Unauthorized',
              headers: {},
              config,
            },
          );
        },
      }),
    ).rejects.toMatchObject({ response: { status: 401 } });

    expect(handler).not.toHaveBeenCalled();
    expect(localStorage.getItem(TOKEN_KEY)).toBe('token-de-sessao-ativa');
    window.removeEventListener('auth:unauthorized', handler);
  });
});