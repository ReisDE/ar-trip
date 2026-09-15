'use client';

import { useEffect, useRef, useState } from 'react';
import { Rodovia } from '../../../../components/Rodovia';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api';

export default function ViagemMotorista({ params }: { params: { id: string } }) {
  const [status, setStatus] = useState<'parado' | 'ligando' | 'ativo' | 'erro'>('parado');
  const [linkRastreio, setLinkRastreio] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const linkPublicoRef = useRef<string | null>(null);

  async function ligarGps() {
    setStatus('ligando');
    setMensagemErro(null);

    if (!('geolocation' in navigator)) {
      setStatus('erro');
      setMensagemErro('Esse celular/navegador não tem suporte a GPS.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/localizacao/viagens/${params.id}/iniciar`, { method: 'POST' });
      const data = await res.json();
      linkPublicoRef.current = data.linkPublico;
      setLinkRastreio(`${window.location.origin}${data.url}`);

      watchIdRef.current = navigator.geolocation.watchPosition(
        async (posicao) => {
          setStatus('ativo');
          await fetch(`${API_URL}/localizacao/${linkPublicoRef.current}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              viagemId: params.id,
              lat: posicao.coords.latitude,
              lng: posicao.coords.longitude,
            }),
          });
        },
        () => {
          setStatus('erro');
          setMensagemErro('Não consegui acessar o GPS. Verifique a permissão de localização do navegador.');
        },
        { enableHighAccuracy: true, maximumAge: 5000 },
      );
    } catch {
      setStatus('erro');
      setMensagemErro('Não consegui falar com o servidor. Confira sua conexão.');
    }
  }

  async function encerrarViagem() {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    await fetch(`${API_URL}/viagens/${params.id}/encerrar`, { method: 'PATCH' });
    setStatus('parado');
    setLinkRastreio(null);
  }

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  return (
    <main className="min-h-screen bg-linho flex flex-col items-center justify-center px-6 py-10 text-center">
      <p className="font-display uppercase tracking-wide text-terracota text-sm mb-2">
        Painel do motorista
      </p>
      <h1 className="font-display text-3xl mb-8">
        {status === 'ativo' ? 'Rastreio ao vivo ligado' : 'Toque para ligar o GPS e começar a viagem'}
      </h1>

      <div className="w-full max-w-lg mb-10">
        <Rodovia animando={status === 'ativo'} />
      </div>

      {status !== 'ativo' && (
        <button
          onClick={ligarGps}
          disabled={status === 'ligando'}
          className="bg-estrada hover:bg-estrada-escura transition-colors text-linho font-display text-xl px-10 py-4 disabled:opacity-60"
        >
          {status === 'ligando' ? 'Ligando GPS...' : 'Ligar GPS e iniciar viagem'}
        </button>
      )}

      {status === 'ativo' && linkRastreio && (
        <div className="w-full max-w-md space-y-4">
          <div className="border border-estrada bg-estrada/10 p-4 text-sm break-all">
            {linkRastreio}
          </div>
          <p className="text-tinta/60 text-sm">
            Esse link já foi mandado pros passageiros. Qualquer amigo ou familiar deles também
            pode abrir e acompanhar a viagem — não precisa de login.
          </p>
          <button
            onClick={encerrarViagem}
            className="border border-terracota text-terracota font-display px-6 py-2 hover:bg-terracota hover:text-linho transition-colors"
          >
            Encerrar viagem
          </button>
        </div>
      )}

      {mensagemErro && <p className="mt-6 text-terracota text-sm max-w-sm">{mensagemErro}</p>}
    </main>
  );
}
