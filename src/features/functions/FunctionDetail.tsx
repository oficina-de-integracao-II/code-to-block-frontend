import { useEffect, useState } from 'react';
import { CodeViewer } from './CodeViewer';
import {
  getFunction,
  type FunctionParameter,
  type FunctionSummary,
} from './functionsApi';

type ParametersResult = {
  id: number;
  parametros: FunctionParameter[] | null;
  failed: boolean;
};

export function FunctionDetail({ fn }: { fn: FunctionSummary }) {
  const [result, setResult] = useState<ParametersResult | null>(null);

  useEffect(() => {
    let active = true;

    getFunction(fn.id)
      .then((response) => {
        if (active) {
          setResult({ id: fn.id, parametros: response.data.parametros, failed: false });
        }
      })
      .catch(() => {
        if (active) setResult({ id: fn.id, parametros: null, failed: true });
      });

    return () => {
      active = false;
    };
  }, [fn.id]);

  const current = result?.id === fn.id ? result : null;
  const parametros = Array.isArray(current?.parametros) ? current.parametros : [];

  return (
    <article
      aria-label={`Detalhe de ${fn.nome}`}
      className="mt-4 flex flex-col gap-3 border-t border-gray-200 pt-4"
    >
      <h3 className="text-base font-semibold">{fn.nome}</h3>

      <div>
        <h4 className="text-sm font-semibold">Descrição e comportamento esperado</h4>
        <p className="mt-1 text-sm text-gray-700">{fn.descricao}</p>
      </div>

      <div>
        <h4 className="text-sm font-semibold">Parâmetros</h4>
        {!current && <p className="mt-1 text-sm text-gray-500">Carregando parâmetros...</p>}
        {current?.failed && (
          <p role="alert" className="mt-1 text-sm text-red-700">
            Não foi possível carregar os parâmetros.
          </p>
        )}
        {current && !current.failed && parametros.length === 0 && (
          <p className="mt-1 text-sm text-gray-500">Esta função não recebe parâmetros.</p>
        )}
        {parametros.length > 0 && (
          <ul className="mt-1 flex flex-col gap-1 text-sm">
            {parametros.map((param) => (
              <li key={param.nome}>
                <code className="font-semibold">{param.nome}</code>
                {param.tipo && <span className="text-gray-500"> ({param.tipo})</span>}
                {param.descricao && <span> — {param.descricao}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <CodeViewer code={fn.codigoArduino} />
    </article>
  );
}
