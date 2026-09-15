'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';
import { AdminGuard } from '../../../components/AdminGuard';

type Viagem = {
  id: string;
  status: string;
  dataSaida: string;
  localEmbarque: string;
  vagasTotais: number;
  vagasOcupadas: number;
  pacote: { destino: string; nome: string };
  motorista: { nome: string } | null;
};

const rotuloStatus: Record<string, string> = {
  agendada: 'Agendada',
  em_andamento: 'Em andamento',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

export default function ViagensDoDia() {
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      setViagens(await apiFetch('/viagens/do-dia'));
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Faça login como admin pra ver o painel');
    }
  }

  useEffect(() => {
    carregar();
    const intervalo = setInterval(carregar, 15000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <AdminGuard>
    <main className="min-h-screen bg-linho px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <p className="font-display uppercase tracking-wide text-terracota text-sm mb-1">Painel do Anderson</p>
        <h1 className="font-display text-3xl mb-8">Viagens de hoje</h1>

        {erro && <p className="text-terracota text-sm mb-6">{erro}</p>}

        {viagens.length === 0 && !erro && (
          <p className="text-tinta/50">Nenhuma viagem programada pra hoje.</p>
        )}

        <div className="space-y-3">
          {viagens.map((v) => (
            <div key={v.id} className="border border-tinta/15 p-5 flex flex-wrap justify-between items-center gap-3">
              <div>
                <p className="font-display text-lg">{v.pacote.destino}</p>
                <p className="text-sm text-tinta/60">
                  Saída {new Date(v.dataSaida).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} ·{' '}
                  {v.localEmbarque}
                </p>
                <p className="text-sm text-tinta/60">
                  Motorista: {v.motorista?.nome ?? 'não definido'} · {v.vagasOcupadas}/{v.vagasTotais} vagas
                </p>
              </div>
              <span className="font-display text-xs uppercase tracking-wide bg-estrada/10 text-estrada px-3 py-1">
                {rotuloStatus[v.status] ?? v.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>

    </AdminGuard>
  );
}
