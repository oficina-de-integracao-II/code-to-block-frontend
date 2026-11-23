import { useId, useMemo, useState } from 'react';
import { useFunctions } from './FunctionsContext';

function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export function FunctionsPanel() {
  const { functions, loading, error, reload } = useFunctions();
  const [query, setQuery] = useState('');
  const searchId = useId();

  const filtered = useMemo(() => {
    const term = normalize(query.trim());

    if (!term) return functions;

    return functions.filter((fn) => normalize(fn.nome).includes(term));
  }, [functions, query]);

  return (
    <section
      aria-label="Painel de funções"
      className="rounded-lg border border-gray-200 bg-white p-4"
    >
      <h2 className="text-lg font-semibold">Funções</h2>

      <div className="mt-3">
        <label htmlFor={searchId} className="sr-only">
          Buscar função
        </label>
        <input
          id={searchId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar função"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="mt-3">
        {loading && <p className="text-sm text-gray-500">Carregando funções...</p>}

        {!loading && error && (
          <div role="alert" className="text-sm text-red-700">
            <p>{error}</p>
            <button
              type="button"
              onClick={reload}
              className="mt-2 underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !error && functions.length === 0 && (
          <p className="text-sm text-gray-500">Nenhuma função disponível.</p>
        )}

        {!loading && !error && functions.length > 0 && filtered.length === 0 && (
          <p className="text-sm text-gray-500">
            Nenhuma função encontrada para "{query.trim()}".
          </p>
        )}

        {!loading && !error && filtered.length > 0 && (
          <ul className="flex flex-col gap-2">
            {filtered.map((fn) => (
              <li
                key={fn.id}
                className="rounded-md border border-gray-200 px-3 py-2"
              >
                <p className="text-sm font-semibold">{fn.nome}</p>
                <p className="text-xs text-gray-500">{fn.descricao}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
