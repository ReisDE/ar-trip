'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';
import { AdminGuard } from '../../../components/AdminGuard';

type Conteudo = {
  id: string;
  tipo: 'foto' | 'video';
  urlArquivo: string;
  legendaGerada: string | null;
  viagem: { pacote: { destino: string } } | null;
  pacote: { destino: string } | null;
};

export default function AprovacaoConteudo() {
  const [pendentes, setPendentes] = useState<Conteudo[]>([]);
  const [legendas, setLegendas] = useState<Record<string, string>>({});
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      const dados: Conteudo[] = await apiFetch('/conteudo/pendentes');
      setPendentes(dados);
      setLegendas(Object.fromEntries(dados.map((c) => [c.id, c.legendaGerada ?? ''])));
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não consegui carregar a fila de conteúdo');
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function aprovarEPublicar(id: string) {
    await apiFetch(`/conteudo/${id}/aprovar`, {
      method: 'PATCH',
      body: JSON.stringify({ legendaFinal: legendas[id] }),
    });
    await apiFetch(`/conteudo/${id}/publicar`, { method: 'POST' });
    carregar();
  }

  async function rejeitar(id: string) {
    await apiFetch(`/conteudo/${id}/rejeitar`, { method: 'PATCH' });
    carregar();
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-linho px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <p className="font-display uppercase tracking-wide text-terracota text-sm mb-1">Painel do Anderson</p>
          <h1 className="font-display text-3xl mb-8">Fila de aprovação de conteúdo</h1>

          {erro && <p className="text-terracota text-sm mb-6">{erro}</p>}
          {pendentes.length === 0 && !erro && (
            <p className="text-tinta/50">Nada pendente — tudo que chegou do WhatsApp já foi revisado.</p>
          )}

          <div className="space-y-6">
            {pendentes.map((c) => (
              <div key={c.id} className="border border-tinta/15 p-5">
                <p className="font-display uppercase text-xs tracking-wide text-terracota mb-2">
                  {c.tipo === 'video' ? 'Vídeo' : 'Foto'} · {c.viagem?.pacote.destino ?? c.pacote?.destino ?? 'Sem viagem vinculada'}
                </p>
                <div className="aspect-video bg-tinta/5 mb-3 flex items-center justify-center text-xs text-tinta/40">
                  {c.urlArquivo || 'Sem preview (URL do arquivo vazia)'}
                </div>
                <textarea
                  className="w-full border border-tinta/20 p-3 text-sm mb-3"
                  rows={2}
                  value={legendas[c.id] ?? ''}
                  onChange={(e) => setLegendas({ ...legendas, [c.id]: e.target.value })}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => aprovarEPublicar(c.id)}
                    className="bg-estrada hover:bg-estrada-escura transition-colors text-linho font-display px-5 py-2 text-sm"
                  >
                    Aprovar e publicar
                  </button>
                  <button
                    onClick={() => rejeitar(c.id)}
                    className="border border-terracota text-terracota font-display px-5 py-2 text-sm hover:bg-terracota hover:text-linho transition-colors"
                  >
                    Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </AdminGuard>
  );
}
