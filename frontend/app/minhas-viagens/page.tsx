'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, pegarCliente } from '../../lib/api';

type Reserva = {
  id: string;
  status: string;
  valorTotal: number;
  viagem: { id: string; dataSaida: string; pacote: { destino: string; nome: string } };
};

const rotuloStatus: Record<string, string> = {
  pendente: 'Aguardando pagamento',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  lista_espera: 'Lista de espera',
};

export default function MinhasViagens() {
  const router = useRouter();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const cliente = pegarCliente();
    if (!cliente) {
      router.push('/login');
      return;
    }
    (async () => {
      try {
        setReservas(await apiFetch(`/reservas/cliente/${cliente.id}`));
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Não consegui carregar suas viagens');
      }
    })();
  }, [router]);

  return (
    <main className="min-h-screen bg-linho px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <p className="font-display uppercase tracking-wide text-terracota text-sm mb-1">Área do viajante</p>
        <h1 className="font-display text-3xl mb-8">Minhas viagens</h1>

        {erro && <p className="text-terracota text-sm mb-6">{erro}</p>}
        {reservas.length === 0 && !erro && <p className="text-tinta/50">Você ainda não tem nenhuma reserva.</p>}

        <div className="space-y-3">
          {reservas.map((r) => (
            <Link
              key={r.id}
              href={`/minhas-viagens/${r.id}`}
              className="flex justify-between items-center border border-tinta/15 hover:border-estrada transition-colors p-5"
            >
              <div>
                <p className="font-display text-lg">{r.viagem.pacote.destino}</p>
                <p className="text-sm text-tinta/60">
                  {new Date(r.viagem.dataSaida).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <span className="text-xs font-display uppercase tracking-wide bg-estrada/10 text-estrada px-3 py-1">
                {rotuloStatus[r.status] ?? r.status}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
