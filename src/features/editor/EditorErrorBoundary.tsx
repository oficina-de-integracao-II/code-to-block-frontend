import { Component, type ReactNode } from 'react';

type EditorErrorBoundaryProps = { children: ReactNode };
type EditorErrorBoundaryState = { failed: boolean };

/**
 * Se o editor não carregar (ex.: queda de conexão ao baixar o Monaco), mostra
 * um aviso no lugar dele em vez de derrubar a tela inteira.
 */
export class EditorErrorBoundary extends Component<
  EditorErrorBoundaryProps,
  EditorErrorBoundaryState
> {
  state: EditorErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): EditorErrorBoundaryState {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div role="alert" className="flex flex-col items-start gap-2 p-5">
        <p className="text-sm text-code-text">Não foi possível carregar o editor.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-[10px] bg-soft-danger px-3 py-2 text-sm
                     font-extrabold text-danger-text"
        >
          Recarregar página
        </button>
      </div>
    );
  }
}
