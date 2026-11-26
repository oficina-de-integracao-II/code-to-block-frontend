import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { useEditor } from './EditorContext';
import { EditorProvider } from './EditorProvider';

function TestConsumer() {
  const { code, insertFunctionCall } = useEditor();

  return (
    <>
      <button type="button" onClick={() => insertFunctionCall('Andar')}>
        Inserir
      </button>
      <pre data-testid="code-state">{code}</pre>
    </>
  );
}

describe('EditorProvider', () => {
  it('acrescenta a chamada ao final do código quando o editor ainda não montou', async () => {
    const user = userEvent.setup();
    render(
      <EditorProvider>
        <TestConsumer />
      </EditorProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Inserir' }));
    await user.click(screen.getByRole('button', { name: 'Inserir' }));

    expect(screen.getByTestId('code-state')).toHaveTextContent('Andar();Andar();');
  });

  it('lança erro ao usar useEditor fora de um EditorProvider', () => {
    function Lonely() {
      useEditor();
      return null;
    }

    expect(() => render(<Lonely />)).toThrow(
      'useEditor deve ser usado dentro de um EditorProvider',
    );
  });
});
