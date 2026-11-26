import { useEffect, useRef } from 'react';

const FOCUSABLE = 'button:not([disabled]), [href], input, [tabindex="0"]';

/**
 * Comportamento de diálogo modal: foca o título ao abrir, fecha com Esc,
 * mantém o Tab dentro do diálogo e devolve o foco ao fechar.
 */
export function useModalDialog(onClose: () => void) {
  const dialogRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    titleRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;

      const items = [...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = items[0];
      const last = items[items.length - 1];
      const index = items.indexOf(document.activeElement as HTMLElement);

      if (event.shiftKey && index <= 0) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && index === items.length - 1) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      opener?.focus();
    };
  }, []);

  return { dialogRef, titleRef };
}
