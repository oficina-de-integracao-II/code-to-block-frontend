import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { TOKEN_KEY } from '../../services/api';
import { AuthContext } from '../auth/AuthContext';
import { FunctionsContext, type FunctionsContextValue } from '../functions/FunctionsContext';
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

/** Catálogo que ainda está carregando: nenhum nome é conhecido. */
const loadingCatalog: FunctionsContextValue = {
  functions: [],
  functionsByName: new Map(),
  loading: true,
  error: null,
  reload: () => {},
};

function markers() {
  return within(screen.getByRole('list', { name: 'Marcadores de erro' })).queryAllByRole(
    'listitem',
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

  it('mantém a ordem das chamadas inseridas antes de o editor montar', async () => {
    const user = userEvent.setup();

    function LateEditor() {
      const { insertFunctionCall } = useEditor();
      const [mounted, setMounted] = useState(false);

      return (
        <>
          <button type="button" onClick={() => insertFunctionCall('Andar')}>Andar</button>
          <button type="button" onClick={() => insertFunctionCall('Pare')}>Pare</button>
          <button type="button" onClick={() => setMounted(true)}>Montar</button>
          {mounted && <CodeEditor />}
          <CodeState />
        </>
      );
    }

    render(
      <FunctionsContext.Provider value={loadingCatalog}>
        <EditorProvider>
          <LateEditor />
        </EditorProvider>
      </FunctionsContext.Provider>,
    );

    await user.click(screen.getByRole('button', { name: 'Andar' }));
    await user.click(screen.getByRole('button', { name: 'Montar' }));
    await user.click(screen.getByRole('button', { name: 'Pare' }));

    expect(screen.getByTestId('code-state')).toHaveTextContent('Andar();Pare();');
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

describe('CodeEditor: marcadores de erro', () => {
  it('sublinha o comando inválido com a mensagem do parser', async () => {
    const user = userEvent.setup();
    renderWorkspace();

    await user.type(screen.getByLabelText('Editor de código'), 'Andar();\nAndarr();');

    const marker = await screen.findByText(
      'Hmm, não conheço "Andarr". Você quis dizer "Andar"? (linha 2, coluna 1)',
    );
    expect(marker).toHaveAttribute('data-range', '2:1-2:10');
    // O erro não impede a digitação: o texto continua chegando ao estado.
    expect(screen.getByTestId('code-state')).toHaveTextContent('Andar(); Andarr();');
  });

  it('remove o marcador quando o código é corrigido', async () => {
    const user = userEvent.setup();
    renderWorkspace();

    const editor = screen.getByLabelText('Editor de código');
    await user.type(editor, 'Andar()');
    expect(markers()).toHaveLength(1);

    await user.type(editor, ';');
    expect(markers()).toHaveLength(0);
  });

  it('marca só a sintaxe enquanto o catálogo não está disponível', async () => {
    const user = userEvent.setup();
    render(
      <FunctionsContext.Provider value={loadingCatalog}>
        <EditorProvider>
          <CodeEditor />
        </EditorProvider>
      </FunctionsContext.Provider>,
    );

    await user.type(screen.getByLabelText('Editor de código'), 'Voar();Pare');

    expect(markers().map((item) => item.textContent)).toEqual([
      'Faltou o "()" depois de "Pare". (linha 1, coluna 8)',
    ]);
  });
});
