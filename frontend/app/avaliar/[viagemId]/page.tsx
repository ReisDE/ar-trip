'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, pegarCliente } from '../../../lib/api';

export default function Avaliar({ params }: { params: { viagemId: string } }) {
  const router = useRouter();
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar() {
    const cliente = pegarCliente();
    if (!cliente) {
      router.push('/login');
      return;
    }
    try {
      await apiFetch('/avaliacoes', {
        method: 'POST',
        body: JSON.stringify({ viagemId: params.viagemId, clienteId: cliente.id, nota, comentario }),
      });
      setEnviado(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não consegui enviar sua avaliação');
    }
  }

  if (enviado) {
    return (
      <main className="min-h-screen bg-linho flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="font-display text-3xl mb-3">Valeu pela avaliação!</h1>
          <p className="text-tinta/60">Isso ajuda a gente (e outros viajantes) muito.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-linho flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="font-display uppercase tracking-wide text-terracota text-sm mb-2">Avaliar viagem</p>
        <h1 className="font-display text-2xl mb-8">Como foi a sua experiência?</h1>

        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setNota(n)}
              className={`text-3xl ${n <= nota ? 'opacity-100' : 'opacity-20'}`}
            >
              ⭐
            </button>
          ))}
        </div>

        <textarea
          className="w-full border border-tinta/20 bg-white p-3 mb-4"
          rows={4}
          placeholder="Conta pra gente como foi (opcional)"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
        />

        {erro && <p className="text-terracota text-sm mb-4">{erro}</p>}

        <button onClick={enviar} className="w-full bg-estrada text-linho font-display py-3">
          Enviar avaliação
        </button>
      </div>
    </main>
  );
}
