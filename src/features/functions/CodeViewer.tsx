import lockIcon from '../../assets/icons/lock.svg';
import { dedent } from './formatCode';
import { highlightCpp, type TokenType } from './highlightCpp';

const TOKEN_CLASS: Record<TokenType, string> = {
  comment: 'text-gray-400',
  string: 'text-green-300',
  preprocessor: 'text-code-keyword',
  keyword: 'text-code-keyword',
  type: 'text-code-keyword',
  function: 'text-code-function',
  constant: '',
  number: '',
  plain: '',
};

export function CodeViewer({ code }: { code: string }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-1.5">
        <h3 className="text-[13px] font-extrabold uppercase tracking-[1px] text-ink-muted">
          Código Arduino
        </h3>
        <img src={lockIcon} alt="" className="size-4" />
        <span className="text-[13px] text-ink-muted">somente leitura</span>
      </div>

      <pre
        tabIndex={0}
        aria-label="Código Arduino (somente leitura)"
        className="overflow-x-auto rounded-16 bg-editor-bg p-4 font-code
                   text-base leading-[normal] text-code-text"
      >
        <code className="language-cpp font-code">
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
