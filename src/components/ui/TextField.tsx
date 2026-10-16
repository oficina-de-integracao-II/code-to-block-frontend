import { useId, type InputHTMLAttributes } from 'react';

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function TextField({ label, error, id, className = '', ...props }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className={`text-sm font-extrabold ${error ? 'text-danger-text' : 'text-ink'}`}
      >
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-16 border-[3px] px-4 py-3.5 text-lg text-ink
          outline-none placeholder:text-ink-muted
          ${error ? 'border-danger-text bg-soft-danger' : 'border-ink bg-surface'}
          ${className}`}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-sm text-danger-text">
          {error}
        </p>
      )}
    </div>
  );
}
