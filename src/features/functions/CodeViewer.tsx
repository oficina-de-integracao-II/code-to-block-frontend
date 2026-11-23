import { useState } from 'react';
import { highlightCpp, type TokenType } from './highlightCpp';

const TOKEN_CLASS: Record<TokenType, string> = {
  comment: 'text-gray-400 italic',
  string: 'text-green-400',
  preprocessor: 'text-pink-400',
  keyword: 'text-purple-400',
  type: 'text-sky-400',
  constant: 'text-orange-300',
  number: 'text-amber-300',
  plain: '',
};

function dedent(code: string) {
  const lines = code.replace(/^\n+|\s+$/g, '').split('\n');
  const indents = lines
    .filter((line) => line.trim())
    .map((line) => line.length - line.trimStart().length);
  const min = indents.length ? Math.min(...indents) : 0;

  return lines.map((line) => line.slice(min)).join('\n');
}

export function CodeViewer({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const text = dedent(code);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopyError(false);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      setCopyError(true);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Código Arduino</h4>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md border border-gray-300 px-2 py-1 text-xs"
        >
          {copied ? 'Copiado!' : 'Copiar código'}
        </button>
      </div>

      {copyError && (
        <p role="alert" className="mt-1 text-xs text-red-700">
          Não foi possível copiar o código.
        </p>
      )}

      <pre
        tabIndex={0}
        aria-label="Código Arduino (somente leitura)"
        className="mt-2 overflow-x-auto rounded-md bg-gray-900 p-3 text-xs
                   text-gray-100"
      >
        <code className="language-cpp">
          {highlightCpp(text).map((token, index) => (
            <span key={index} className={TOKEN_CLASS[token.type]}>
              {token.text}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
