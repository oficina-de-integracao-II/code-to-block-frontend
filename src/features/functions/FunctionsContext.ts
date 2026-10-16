import { createContext, useContext } from 'react';
import type { FunctionSummary } from './functionsApi';

export type FunctionsContextValue = {
  functions: FunctionSummary[];
  functionsByName: Map<string, FunctionSummary>;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

export const FunctionsContext = createContext<FunctionsContextValue | undefined>(undefined);

export function useFunctions() {
  const context = useContext(FunctionsContext);

  if (!context) {
    throw new Error('useFunctions deve ser usado dentro de um FunctionsProvider');
  }

  return context;
}
