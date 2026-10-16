import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

async function importFresh() {
  vi.resetModules();
  return import('./loadGoogleScript');
}

describe('loadGoogleScript', () => {
  beforeEach(() => {
    document
      .querySelectorAll(`script[src="${SCRIPT_SRC}"]`)
      .forEach((el) => el.remove());
    delete window.google;
  });

  afterEach(() => {
    delete window.google;
  });

  it('resolve imediatamente se o SDK já estiver disponível', async () => {
    window.google = {
      accounts: { id: { initialize: vi.fn(), renderButton: vi.fn(), prompt: vi.fn() } },
    };
    const { loadGoogleScript } = await importFresh();

    await expect(loadGoogleScript()).resolves.toBeUndefined();
    expect(document.querySelector(`script[src="${SCRIPT_SRC}"]`)).toBeNull();
  });

  it('injeta o script no <head> e resolve quando ele carrega', async () => {
    const { loadGoogleScript } = await importFresh();

    const promise = loadGoogleScript();
    const script = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`,
    );
    expect(script).not.toBeNull();

    script!.onload?.(new Event('load'));

    await expect(promise).resolves.toBeUndefined();
  });

  it('rejeita quando o script falha ao carregar', async () => {
    const { loadGoogleScript } = await importFresh();

    const promise = loadGoogleScript();
    const script = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`,
    );

    script!.onerror?.(new Event('error'));

    await expect(promise).rejects.toThrow('Falha ao carregar o script do Google');
  });

  it('aguarda o load de um <script> já presente no documento, sem duplicar', async () => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    document.head.appendChild(script);

    const { loadGoogleScript } = await importFresh();

    const promise = loadGoogleScript();
    script.dispatchEvent(new Event('load'));

    await expect(promise).resolves.toBeUndefined();
    expect(document.querySelectorAll(`script[src="${SCRIPT_SRC}"]`)).toHaveLength(1);
  });

  it('reutiliza a mesma promise entre chamadas simultâneas', async () => {
    const { loadGoogleScript } = await importFresh();

    const first = loadGoogleScript();
    const second = loadGoogleScript();

    expect(document.querySelectorAll(`script[src="${SCRIPT_SRC}"]`)).toHaveLength(1);

    const script = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`,
    );
    script!.onload?.(new Event('load'));

    await expect(first).resolves.toBeUndefined();
    await expect(second).resolves.toBeUndefined();
  });
});
