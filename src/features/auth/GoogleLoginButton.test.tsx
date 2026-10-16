import { render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GoogleLoginButton } from './GoogleLoginButton';

vi.mock('./loadGoogleScript', () => ({
  loadGoogleScript: vi.fn().mockResolvedValue(undefined),
}));

function mockGoogleSdk() {
  const initialize = vi.fn();
  const renderButton = vi.fn();

  window.google = {
    accounts: { id: { initialize, renderButton, prompt: vi.fn() } },
  };

  return { initialize, renderButton };
}

describe('GoogleLoginButton', () => {
  afterEach(() => {
    delete window.google;
    vi.unstubAllEnvs();
  });

  it('inicializa e renderiza o botão oficial do Google (nenhuma chamada real)', async () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'client-id-teste');
    const { initialize, renderButton } = mockGoogleSdk();

    render(<GoogleLoginButton onSuccess={vi.fn()} onError={vi.fn()} />);

    await waitFor(() => expect(initialize).toHaveBeenCalledWith(
      expect.objectContaining({ client_id: 'client-id-teste' }),
    ));
    expect(renderButton).toHaveBeenCalledTimes(1);
  });

  it('chama onSuccess com o ID token quando o Google retorna credential', async () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'client-id-teste');
    const { initialize } = mockGoogleSdk();
    const onSuccess = vi.fn();

    render(<GoogleLoginButton onSuccess={onSuccess} onError={vi.fn()} />);

    await waitFor(() => expect(initialize).toHaveBeenCalled());
    const { callback } = initialize.mock.calls[0][0];
    callback({ credential: 'id-token-falso' });

    expect(onSuccess).toHaveBeenCalledWith('id-token-falso');
  });

  it('chama onError quando o Google retorna resposta sem credential', async () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'client-id-teste');
    const { initialize } = mockGoogleSdk();
    const onError = vi.fn();

    render(<GoogleLoginButton onSuccess={vi.fn()} onError={onError} />);

    await waitFor(() => expect(initialize).toHaveBeenCalled());
    const { callback } = initialize.mock.calls[0][0];
    callback({ credential: '' });

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('chama onError quando o VITE_GOOGLE_CLIENT_ID não está configurado', () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '');
    const onError = vi.fn();

    render(<GoogleLoginButton onSuccess={vi.fn()} onError={onError} />);

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('chama onError quando o script do Google falha ao carregar', async () => {
    const { loadGoogleScript } = await import('./loadGoogleScript');
    vi.mocked(loadGoogleScript).mockRejectedValueOnce(new Error('falhou'));
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'client-id-teste');
    const onError = vi.fn();

    render(<GoogleLoginButton onSuccess={vi.fn()} onError={onError} />);

    await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
  });
});
