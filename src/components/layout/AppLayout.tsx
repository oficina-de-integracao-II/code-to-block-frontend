import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { useEditor } from '../../features/editor/EditorContext';
import { FunctionsPanel } from '../../features/functions/FunctionsPanel';
import { LogoutButton } from '../../features/auth/LogoutButton';

// O Monaco é pesado: carregado só quando a área de trabalho abre.
const CodeEditor = lazy(() =>
  import('../../features/editor/CodeEditor').then((module) => ({ default: module.CodeEditor })),
);

export function AppLayout() {
  const { insertFunctionCall } = useEditor();

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-gray-900">
      <header className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold">Code to Blocks</h1>
        <LogoutButton />
      </header>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[340px_minmax(0,1fr)_480px]">
        <FunctionsPanel onSelectFunction={insertFunctionCall} />

        <section aria-label="Editor" className="bg-editor-bg">
          <div data-testid="editor-area" className="h-[70vh] min-h-96">
            <Suspense
              fallback={<p className="p-5 text-sm text-editor-gutter">Carregando editor...</p>}
            >
              <CodeEditor />
            </Suspense>
          </div>
        </section>

        <section
          aria-label="Painel de blocos"
          className="min-h-96 rounded-lg border border-gray-200
                     bg-white p-4"
        >
          <h2 className="text-lg font-semibold">Blocos</h2>
          <div
            data-testid="blocks-area"
            className="mt-3 min-h-72 rounded-md border border-dashed
                       border-gray-300 bg-gray-50 p-4"
          >
            <p className="text-sm text-gray-500">
              Área de visualização dos blocos
            </p>
          </div>
        </section>
      </div>

      <Outlet />
    </main>
  );
}
