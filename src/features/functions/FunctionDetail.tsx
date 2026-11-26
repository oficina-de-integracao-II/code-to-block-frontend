import { useEffect, useId, useState, type ReactNode } from 'react';
import { CodeViewer } from './CodeViewer';
import { CopyCodeButton } from './CopyCodeButton';
import { dedent } from './formatCode';
import { getFunction, type FunctionSummary } from './functionsApi';
import { normalizeParameters } from './normalizeParameters';
import { useModalDialog } from './useModalDialog';

type ParametersResult = {
  id: number;
  parametros: unknown;
  failed: boolean;
};

type FunctionDetailProps = {
  fn: FunctionSummary;
  onClose: () => void;
};

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="text-xs font-bold uppercase tracking-wide text-ink-muted">
        {title}
      </h3>
      <div className="mt-1 text-base text-ink">{children}</div>
    </section>
  );
}

export function FunctionDetail({ fn, onClose }: FunctionDetailProps) {
  const [result, setResult] = useState<ParametersResult | null>(null);
  const { dialogRef, titleRef } = useModalDialog(onClose);
  const titleId = useId();

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
  const parametros = normalizeParameters(current?.parametros);

  return (
    <>
      <div
        data-testid="detail-backdrop"
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-ink/40"
      />

      <aside
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed inset-y-0 right-0 z-50 flex w-[440px] flex-col bg-surface
                   shadow-xl max-[769px]:w-full"
      >
        <header className="flex items-center gap-3 p-5">
          <button
            type="button"
            aria-label="Voltar"
            onClick={onClose}
            className="cursor-pointer text-xl text-ink"
          >
            ←
          </button>
          <h2
            ref={titleRef}
            id={titleId}
            tabIndex={-1}
            className="min-w-0 flex-1 truncate font-heading text-xl font-bold
                       text-ink outline-none"
          >
            {fn.nome}
          </h2>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="cursor-pointer text-xl text-ink"
          >
            ✕
          </button>
        </header>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 pb-5">
          <DetailSection title="Descrição">
            <p>{fn.descricao}</p>
          </DetailSection>

          <DetailSection title="Parâmetros">
            {!current && <p className="text-ink-muted">Carregando parâmetros...</p>}
            {current?.failed && (
              <p role="alert" className="text-danger-text">
                Não foi possível carregar os parâmetros.
              </p>
            )}
            {current && !current.failed && parametros.length === 0 && (
              <p>Nenhum — é só chamar e pronto!</p>
            )}
            {parametros.length > 0 && (
              <ul className="flex flex-col gap-1">
                {parametros.map((param, index) => (
                  <li key={`${param.nome}-${index}`}>
                    <code className="font-bold">{param.nome}</code>
                    {param.tipo && <span className="text-ink-muted"> ({param.tipo})</span>}
                    {param.descricao && <span> — {param.descricao}</span>}
                  </li>
                ))}
              </ul>
            )}
          </DetailSection>

          {/* TODO: seção "Comportamento" quando a API tiver um campo próprio. */}

          <CodeViewer code={fn.codigoArduino} />
        </div>

        <footer className="px-5 pt-3 pb-6">
          <CopyCodeButton text={dedent(fn.codigoArduino)} />
        </footer>
      </aside>
    </>
  );
}
