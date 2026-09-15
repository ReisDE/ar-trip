'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';
import { AdminGuard } from '../../../components/AdminGuard';

type ViagemAtiva = {
  id: string;
  pacote: { destino: string };
  localizacoes: { lat: number; lng: number; registradoEm: string }[];
};

export default function PainelLocalizacao() {
  const [viagens, setViagens] = useState<ViagemAtiva[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      setViagens(await apiFetch('/localizacao/painel'));
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Faça login como admin pra ver o painel');
    }
  }

  useEffect(() => {
    carregar();
    const intervalo = setInterval(carregar, 10000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <AdminGuard>
    <main className="min-h-screen bg-linho px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <p className="font-display uppercase tracking-wide text-terracota text-sm mb-1">Painel do Anderson</p>
        <h1 className="font-display text-3xl mb-8">Ônibus em viagem agora</h1>

        {erro && <p className="text-terracota text-sm mb-6">{erro}</p>}
        {viagens.length === 0 && !erro && <p className="text-tinta/50">Nenhuma viagem em andamento no momento.</p>}

        <div className="grid md:grid-cols-2 gap-6">
          {viagens.map((v) => {
            const ultima = v.localizacoes[0];
            return (
              <div key={v.id} className="border border-tinta/15">
                <div className="aspect-video">
                  {ultima ? (
                    <iframe
                      title={`Mapa de ${v.pacote.destino}`}
                      className="w-full h-full border-0"
                      src={`https://maps.google.com/maps?q=${ultima.lat},${ultima.lng}&z=13&output=embed`}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-tinta/10 flex items-center justify-center text-sm text-tinta/40">
                      Aguardando primeiro sinal de GPS
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-display text-lg">{v.pacote.destino}</p>
                  {ultima && (
                    <p className="text-xs text-tinta/50">
                      Última atualização{' '}
                      {new Date(ultima.registradoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>

    </AdminGuard>
  );
}
