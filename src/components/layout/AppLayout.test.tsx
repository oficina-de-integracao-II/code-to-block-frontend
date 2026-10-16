import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../../features/auth/AuthProvider';
import { AppLayout } from './AppLayout';

describe('AppLayout', () => {
  it('renderiza as áreas de funções, editor e blocos', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('region', {
      name: 'Painel de funções',
    })).toBeInTheDocument();

    expect(screen.getByRole('region', {
      name: 'Editor',
    })).toBeInTheDocument();

    expect(screen.getByRole('region', {
      name: 'Painel de blocos',
    })).toBeInTheDocument();
  });
});