import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';
import { FunctionsContext } from './FunctionsContext';
import { listFunctions, type FunctionSummary } from './functionsApi';

function indexByName(functions: FunctionSummary[]) {
  return new Map(functions.map((fn) => [fn.nome, fn]));
}

export function FunctionsProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [functions, setFunctions] = useState<FunctionSummary[]>([]);
  const [loading, setLoading] = useState(() => Boolean(token));
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);

    listFunctions()
      .then((response) => setFunctions(response.data))
      .catch(() => setError('Não foi possível carregar as funções.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      if (token) {
        load();
      } else {
        setFunctions([]);
        setError(null);
      }
    });
  }, [token, load]);

  const functionsByName = useMemo(() => indexByName(functions), [functions]);

  const value = useMemo(
    () => ({ functions, functionsByName, loading, error, reload: load }),
    [functions, functionsByName, loading, error, load],
  );

  return <FunctionsContext.Provider value={value}>{children}</FunctionsContext.Provider>;
}
