'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { pegarCliente, encerrarSessao } from '../../lib/api';

export default function Perfil() {
  const router = useRouter();
  const [cliente, setCliente] = useState<{ nome: string; pontosFidelidade?: number; codigoIndicacao?: string } | null>(null);

  useEffect(() => {
    const c = pegarCliente();
    if (!c) {
      router.push('/login');
      return;
    }
    setCliente(c);
  }, [router]);

  if (!cliente) return null;

  const linkIndicacao = typeof window !== 'undefined' ? `${window.location.origin}/cadastro?ref=${cliente.codigoIndicacao}` : '';

  return (
    <main className="min-h-screen bg-linho px-6 py-10">
      <div className="max-w-md mx-auto">
        <p className="font-display uppercase tracking-wide text-terracota text-sm mb-1">Minha conta</p>
        <h1 className="font-display text-3xl mb-8">Olá, {cliente.nome.split(' ')[0]}</h1>

        <div className="border border-estrada bg-estrada/10 p-6 mb-6">
          <p className="text-sm text-tinta/60 mb-1">Pontos de fidelidade</p>
          <p className="font-display text-4xl text-estrada">{cliente.pontosFidelidade ?? 0}</p>
          <p className="text-xs text-tinta/50 mt-2">Você ganha pontos automaticamente a cada viagem concluída.</p>
        </div>

        <div className="border border-tinta/15 p-6 mb-6">
          <p className="text-sm text-tinta/60 mb-2">Seu link de indicação</p>
          <div className="bg-linho border border-tinta/10 p-3 text-xs break-all mb-3">{linkIndicacao}</div>
          <p className="text-xs text-tinta/50">Cada amigo que se cadastrar por esse link te dá pontos de fidelidade extras quando ele viajar.</p>
        </div>

        <a href="/minhas-viagens" className="block text-estrada underline text-sm mb-4">Ver minhas viagens</a>
        <button
          onClick={() => {
            encerrarSessao();
            router.push('/');
          }}
          className="text-terracota text-sm underline"
        >
          Sair da conta
        </button>
      </div>
    </main>
  );
}
