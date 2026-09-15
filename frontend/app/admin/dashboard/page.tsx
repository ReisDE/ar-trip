'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';
import { AdminGuard } from '../../../components/AdminGuard';

type Metricas = {
  faturamentoTotal: number;
  totalReservasConfirmadas: number;
  viagensConcluidas: number;
  notaMedia: number | null;
};

type FaturamentoDestino = { destino: string; pacote: string; faturamento: number; ocupacaoPercentual: number };

function formatarPreco(valor: number) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function Dashboard() {
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [porDestino, setPorDestino] = useState<FaturamentoDestino[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setMetricas(await apiFetch('/dashboard/metricas'));
        setPorDestino(await apiFetch('/dashboard/faturamento-por-destino'));
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Não consegui carregar o dashboard');
      }
    })();
  }, []);

  return (
    <AdminGuard>
      <main className="min-h-screen bg-linho px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <p className="font-display uppercase tracking-wide text-terracota text-sm mb-1">Painel do Anderson</p>
          <h1 className="font-display text-3xl mb-8">Dashboard</h1>

          {erro && <p className="text-terracota text-sm mb-6">{erro}</p>}

          {metricas && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <div className="border border-tinta/15 p-5">
                <p className="text-xs text-tinta/50 uppercase tracking-wide mb-1">Faturamento total</p>
                <p className="font-display text-2xl text-estrada">{formatarPreco(metricas.faturamentoTotal)}</p>
              </div>
              <div className="border border-tinta/15 p-5">
                <p className="text-xs text-tinta/50 uppercase tracking-wide mb-1">Reservas confirmadas</p>
                <p className="font-display text-2xl">{metricas.totalReservasConfirmadas}</p>
              </div>
              <div className="border border-tinta/15 p-5">
                <p className="text-xs text-tinta/50 uppercase tracking-wide mb-1">Viagens concluídas</p>
                <p className="font-display text-2xl">{metricas.viagensConcluidas}</p>
              </div>
              <div className="border border-tinta/15 p-5">
                <p className="text-xs text-tinta/50 uppercase tracking-wide mb-1">Nota média</p>
                <p className="font-display text-2xl">{metricas.notaMedia ? metricas.notaMedia.toFixed(1) : '—'}</p>
              </div>
            </div>
          )}

          <h2 className="font-display text-2xl mb-4">Faturamento e ocupação por destino</h2>
          <div className="space-y-2">
            {porDestino.map((d) => (
              <div key={d.destino + d.pacote} className="flex justify-between border border-tinta/15 p-4">
                <div>
                  <p className="font-display">{d.destino}</p>
                  <p className="text-sm text-tinta/50">{d.pacote}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-estrada">{formatarPreco(d.faturamento)}</p>
                  <p className="text-sm text-tinta/50">{d.ocupacaoPercentual}% ocupação</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </AdminGuard>
  );
}
