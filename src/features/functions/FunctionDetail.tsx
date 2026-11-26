import { useEffect, useId, useState, type ReactNode } from 'react';
import arrowLeftIcon from '../../assets/icons/arrow-left.svg';
import closeIcon from '../../assets/icons/x.svg';
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
    <section className="flex flex-col gap-4 leading-[normal]">
      <h3 className="text-[13px] font-extrabold uppercase tracking-[1px] text-ink-muted">
        {title}
      </h3>
      <div className="text-lg leading-[normal] text-ink">{children}</div>
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
        className="fixed inset-0 z-40 bg-[rgba(13,20,38,0.55)]"
      />

      <aside
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed inset-y-0 right-0 z-50 flex w-[440px] flex-col bg-surface
                   shadow-[-4px_0px_24px_0px_rgba(0,0,0,0.25)] max-[769px]:w-full"
      >
        <header className="flex items-center gap-3 border-b-2 border-divider p-6">
          <button
            type="button"
            aria-label="Voltar"
            onClick={onClose}
            className="cursor-pointer"
          >
            <img src={arrowLeftIcon} alt="" className="size-6" />
          </button>
          <h2
            ref={titleRef}
            id={titleId}
            tabIndex={-1}
            className="min-w-0 flex-1 truncate font-heading text-2xl font-bold
                       leading-[normal] text-ink outline-none"
          >
            {fn.nome}
          </h2>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="cursor-pointer"
          >
            <img src={closeIcon} alt="" className="size-6" />
          </button>
        </header>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
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

        <footer className="border-t-2 border-divider px-6 py-5">
          <CopyCodeButton text={dedent(fn.codigoArduino)} />
        </footer>
      </aside>
    </>
  );
}
