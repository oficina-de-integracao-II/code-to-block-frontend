import type { ButtonHTMLAttributes } from 'react';

type ButtonStyle = 'principal' | 'secundario' | 'destrutivo' | 'celebracao';

const styleClasses: Record<ButtonStyle, string> = {
  principal: 'border-ink bg-primary text-white',
  secundario: 'border-ink bg-surface text-ink',
  destrutivo: 'border-danger-text bg-soft-danger text-danger-text',
  celebracao: 'border-ink bg-sun text-ink',
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  styleVariant?: ButtonStyle;
};

export function Button({
  styleVariant = 'principal',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`flex w-full items-center justify-center gap-2 rounded-16
        border-[3px] px-6 py-4 font-heading text-lg font-bold
        shadow-[0px_4px_0px_0px_#1f2945]
        disabled:cursor-not-allowed disabled:bg-[#d5dbe8]
        disabled:text-ink-muted
        ${styleClasses[styleVariant]} ${className}`}
      {...props}
    />
  );
}
