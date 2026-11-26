import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/ui/Button';

const FEEDBACK_MS = 2000;

export function CopyCodeButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  async function handleCopy() {
    window.clearTimeout(timeoutRef.current);

    try {
      // `navigator.clipboard` não existe fora de contexto seguro (ex.: http por IP).
      if (!navigator.clipboard) throw new Error('clipboard indisponível');

      await navigator.clipboard.writeText(text);
      setFailed(false);
      setCopied(true);
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setCopied(false), FEEDBACK_MS);
    } catch {
      setCopied(false);
      setFailed(true);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {failed && (
        <p role="alert" className="text-sm text-danger-text">
          Não foi possível copiar o código.
        </p>
      )}
      <Button type="button" styleVariant="secundario" onClick={handleCopy}>
        {copied ? 'Copiou!' : 'Copiar código'}
      </Button>
    </div>
  );
}
