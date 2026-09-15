'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, pegarCliente } from '../lib/api';

type Poltrona = { id: string; numero: string; ocupada: boolean };

export function CardViagem({ viagemId }: { viagemId: string }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [poltronas, setPoltronas] = useState<Poltrona[] | null>(null);
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function abrirMapa() {
    setAberto(true);
    if (poltronas) return;
    try {
      const mapa = await apiFetch(`/onibus/viagens/${viagemId}/mapa`);
      setPoltronas(mapa.poltronas);
    } catch {
      // Sem ônibus vinculado ainda — segue sem mapa, reserva sem poltrona específica.
      setPoltronas([]);
    }
  }

  async function reservar() {
    setErro(null);
    const cliente = pegarCliente();
    if (!cliente) {
      router.push('/login');
      return;
    }

    setCarregando(true);
    try {
      const reserva = await apiFetch('/reservas', {
        method: 'POST',
        body: JSON.stringify({ viagemId, clienteId: cliente.id, poltronaId: selecionada ?? undefined }),
      });
      router.push(`/checkout/${reserva.id}`);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não consegui criar a reserva agora');
      setCarregando(false);
    }
  }

  if (!aberto) {
    return (
      <button
        onClick={abrirMapa}
        className="bg-estrada hover:bg-estrada-escura transition-colors text-linho font-display px-6 py-2"
      >
        Reservar
      </button>
    );
  }

  return (
    <div className="w-full mt-4 border border-tinta/15 p-4 bg-white">
      {poltronas === null && <p className="text-sm text-tinta/50">Carregando mapa de poltronas...</p>}

      {poltronas && poltronas.length > 0 && (
        <>
          <p className="font-display text-sm uppercase tracking-wide mb-3">Escolha sua poltrona</p>
          <div className="grid grid-cols-6 gap-2 mb-4 max-w-xs">
            {poltronas.map((p) => (
              <button
                key={p.id}
                disabled={p.ocupada}
                onClick={() => setSelecionada(p.id)}
                className={`aspect-square text-xs font-display border ${
                  p.ocupada
                    ? 'bg-tinta/10 text-tinta/30 cursor-not-allowed'
                    : selecionada === p.id
                      ? 'bg-estrada text-linho border-estrada'
                      : 'border-tinta/20 hover:border-estrada'
                }`}
              >
                {p.numero}
              </button>
            ))}
          </div>
          <div className="flex gap-4 text-xs text-tinta/50 mb-4">
            <span>⬜ livre</span>
            <span>🟩 selecionada</span>
            <span>⬛ ocupada</span>
          </div>
        </>
      )}

      {poltronas && poltronas.length === 0 && (
        <p className="text-sm text-tinta/50 mb-4">Sem mapa de poltronas cadastrado pra esse ônibus ainda — a reserva segue sem poltrona fixa.</p>
      )}

      {erro && <p className="text-terracota text-xs mb-3">{erro}</p>}

      <button
        onClick={reservar}
        disabled={carregando || (poltronas !== null && poltronas.length > 0 && !selecionada)}
        className="bg-estrada hover:bg-estrada-escura transition-colors text-linho font-display px-6 py-2 disabled:opacity-50"
      >
        {carregando ? 'Reservando...' : 'Confirmar reserva'}
      </button>
    </div>
  );
}
