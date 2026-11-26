import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './server';

// O Monaco não roda no jsdom: usamos um <textarea> no lugar (ver monacoMock).
vi.mock('@monaco-editor/react', async () => {
  const { MockMonacoEditor } = await import('./monacoMock');
  return { default: MockMonacoEditor };
});
vi.mock('../features/editor/monacoSetup', () => ({}));

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
  cleanup();
});

afterAll(() => {
  server.close();
});