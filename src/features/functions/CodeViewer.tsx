import { dedent } from './formatCode';
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

export function CodeViewer({ code }: { code: string }) {
  return (
    <section>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-xs font-bold uppercase tracking-wide text-ink-muted">
          Código Arduino
        </h3>
        <span className="text-xs text-ink-muted">
          <span aria-hidden="true">🔒 </span>somente leitura
        </span>
      </div>

      <pre
        tabIndex={0}
        aria-label="Código Arduino (somente leitura)"
        className="mt-2 overflow-x-auto rounded-16 bg-ink p-4 text-sm text-white"
      >
        <code className="language-cpp">
          {highlightCpp(dedent(code)).map((token, index) => (
            <span key={index} className={TOKEN_CLASS[token.type]}>
              {token.text}
            </span>
          ))}
        </code>
      </pre>
    </section>
  );
}
