import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { TOKEN_KEY } from '../services/api';
import { AppRouter } from './router';

describe('AppRouter', () => {
  afterEach(() => localStorage.clear());

  it('mostra a área de trabalho em /app quando há sessão ativa', () => {
    localStorage.setItem(TOKEN_KEY, 'token-valido');
    window.history.pushState({}, '', '/app');

    render(<AppRouter />);

    expect(screen.getByText('Bem-vindo ao editor!')).toBeInTheDocument();
  });
});
