import { useId, useMemo, useState } from 'react';
import infoIcon from '../../assets/icons/info.svg';
import magnifyingGlassIcon from '../../assets/icons/magnifying-glass.svg';
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
      className="flex flex-col gap-3 bg-surface p-5"
    >
      <h2 className="text-sm font-extrabold uppercase text-ink-muted">Funções</h2>

      <div
        className="flex items-center gap-2 rounded-[12px] bg-bg px-3 py-2.5
                   focus-within:outline-2 focus-within:outline-primary"
      >
        <img
          src={magnifyingGlassIcon}
          alt=""
          className="size-[18px] shrink-0"
        />
        <label htmlFor={searchId} className="sr-only">
          Buscar função
        </label>
        <input
          id={searchId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar função"
          className="w-full bg-transparent text-sm text-ink outline-none
                     placeholder:text-ink-muted"
        />
      </div>

      {loading && (
        <div role="status" aria-label="Carregando funções" className="flex flex-col gap-1">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-5 w-full animate-pulse rounded-[6px] bg-bg" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div role="alert" className="flex flex-col items-start gap-1">
          <p className="text-sm text-danger-text">{error}</p>
          <button
            type="button"
            onClick={reload}
            className="rounded-[10px] bg-soft-danger px-3 py-2 text-sm
                       font-extrabold text-danger-text"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && !error && functions.length === 0 && (
        <p className="text-sm text-ink-muted">Nenhuma função disponível.</p>
      )}

      {!loading && !error && functions.length > 0 && filtered.length === 0 && (
        <p className="text-sm text-ink-muted">
          Nenhuma função encontrada para "{query.trim()}".
        </p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <ul className="flex flex-col gap-1">
          {filtered.map((fn) => (
            <li
              key={fn.id}
              title={fn.descricao}
              className="flex items-center gap-2 rounded-[8px] px-2.5 py-2"
            >
              <span className="min-w-0 flex-1 text-base text-ink">{fn.nome}</span>
              <img src={infoIcon} alt="" className="size-4 shrink-0" />
              <span className="sr-only">{fn.descricao}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
