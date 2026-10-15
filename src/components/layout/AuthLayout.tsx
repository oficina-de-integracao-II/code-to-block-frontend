import type { ReactNode } from 'react';
import { Logo } from '../ui/Logo';

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-7 bg-bg p-6">
      <Logo />
      <p className="text-lg text-ink-muted">Escreva código, veja os blocos.</p>
      <div className="flex w-full max-w-[440px] flex-col gap-4 rounded-3xl border-[3px] border-ink bg-surface p-8 shadow-[0px_4px_0px_0px_#1f2a44]">
        {children}
      </div>
    </main>
  );
}
