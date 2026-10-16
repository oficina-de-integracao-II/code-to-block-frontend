import { Outlet } from 'react-router-dom';
import { LogoutButton } from '../../features/auth/LogoutButton';

export function AppLayout() {
  return (
    <main className="min-h-screen bg-gray-50 p-6 text-gray-900">
      <header className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold">Code to Blocks</h1>
        <LogoutButton />
      </header>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-[1fr_0.8fr]">
        <div className="flex min-w-0 flex-col gap-4">
          <section
            aria-label="Painel de funções"
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <h2 className="text-lg font-semibold">Funções</h2>
            <p className="mt-2 text-sm text-gray-500">
              Funções disponíveis
            </p>
          </section>

          <section
            aria-label="Editor"
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <h2 className="text-lg font-semibold">Editor</h2>
            <div
              data-testid="editor-area"
              className="mt-3 min-h-72 rounded-md border border-dashed
                         border-gray-300 bg-gray-50 p-4"
            >
              <p className="text-sm text-gray-500">
                Área de edição de código
              </p>
            </div>
          </section>
        </div>

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