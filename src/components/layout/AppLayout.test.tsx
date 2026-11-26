import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../../features/auth/AuthProvider';
import { EditorProvider } from '../../features/editor/EditorProvider';
import { FunctionsProvider } from '../../features/functions/FunctionsProvider';
import { AppLayout } from './AppLayout';

describe('AppLayout', () => {
  it('renderiza as áreas de funções, editor e blocos', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <FunctionsProvider>
            <EditorProvider>
              <AppLayout />
            </EditorProvider>
          </FunctionsProvider>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('region', {
      name: 'Painel de funções',
    })).toBeInTheDocument();

    const editorRegion = screen.getByRole('region', { name: 'Editor' });
    expect(await within(editorRegion).findByLabelText('Editor de código')).toBeInTheDocument();

    expect(screen.getByRole('region', {
      name: 'Painel de blocos',
    })).toBeInTheDocument();
  });
});