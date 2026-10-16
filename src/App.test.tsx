import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders without errors e redireciona para o login sem sessão', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Entrar' }),
    ).toBeInTheDocument();
  });
});