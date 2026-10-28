import type { ReactNode } from 'react';
import { TopBar } from '@/components/top-bar';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <TopBar />
      <main className="mx-auto flex w-full max-w-[440px] flex-col px-4 py-12">{children}</main>
    </>
  );
}
