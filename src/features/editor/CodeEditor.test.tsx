import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { TOKEN_KEY } from '../../services/api';
import { AuthContext } from '../auth/AuthContext';
import { FunctionsPanel } from '../functions/FunctionsPanel';
import { FunctionsProvider } from '../functions/FunctionsProvider';
import { CodeEditor } from './CodeEditor';
import { useEditor } from './EditorContext';
import { EditorProvider } from './EditorProvider';

const authValue = {
  user: { id: 1, nome: 'Ana', email: 'ana@email.com', role: 'USER' as const },
  token: 'token-valido',
  login: () => {},
  logout: () => {},
};

function CodeState() {
  const { code } = useEditor();
  return <pre data-testid="code-state">{code}</pre>;
}

function Workspace() {
  const { insertFunctionCall } = useEditor();

  return (
    <>
      <FunctionsPanel onSelectFunction={insertFunctionCall} />
      <CodeEditor />
      <CodeState />
    </>
  );
}

function renderWorkspace() {
  localStorage.setItem(TOKEN_KEY, 'token-valido');

  return render(
    <AuthContext.Provider value={authValue}>
      <FunctionsProvider>
        <EditorProvider>
          <Workspace />
        </EditorProvider>
      </FunctionsProvider>
    </AuthContext.Provider>,
  );
}

describe('CodeEditor', () => {
  it('renderiza o editor vazio com o placeholder do protótipo', () => {
    renderWorkspace();

    const editor = screen.getByLabelText('Editor de código');
    expect(editor).toHaveValue('');
    expect(editor).toHaveAttribute('placeholder', '// Digite uma função, por exemplo: Andar();');
  });

  it('disponibiliza o texto digitado no estado da aplicação', async () => {
    const user = userEvent.setup();
    renderWorkspace();

    await user.type(screen.getByLabelText('Editor de código'), 'Andar();');

    expect(screen.getByTestId('code-state')).toHaveTextContent('Andar();');
  });

  it('insere a chamada da função clicada na posição do cursor', async () => {
    const user = userEvent.setup();
    renderWorkspace();

    const editor = screen.getByLabelText<HTMLTextAreaElement>('Editor de código');
    await user.type(editor, 'Andar();Pare();');
    editor.setSelectionRange(8, 8);

    await user.click(await screen.findByRole('button', { name: 'Inserir VireEsquerda' }));

    expect(screen.getByTestId('code-state')).toHaveTextContent('Andar();VireEsquerda();Pare();');
    expect(editor).toHaveValue('Andar();VireEsquerda();Pare();');
  });
});
