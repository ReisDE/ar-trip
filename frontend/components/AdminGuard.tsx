'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { pegarTipo } from '../lib/api';

/** Envolve páginas de /admin/* — manda pra fora quem não logou como admin. */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    const tipo = pegarTipo();
    if (tipo !== 'admin') {
      router.push('/login');
      return;
    }
    setAutorizado(true);
  }, [router]);

  if (!autorizado) {
    return (
      <main className="min-h-screen bg-linho flex items-center justify-center">
        <p className="text-tinta/50">Verificando acesso...</p>
      </main>
    );
  }

  return <>{children}</>;
}
