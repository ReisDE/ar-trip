'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api';

type Localizacao = {
  lat: number;
  lng: number;
  registradoEm: string;
  viagem: { pacote: { destino: string; nome: string } };
};

export default function PaginaRastreio({ params }: { params: { token: string } }) {
  const [localizacao, setLocalizacao] = useState<Localizacao | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  async function buscar() {
    try {
      const res = await fetch(`${API_URL}/localizacao/rastreio/${params.token}`, { cache: 'no-store' });
      if (!res.ok) {
        setErro('Esse link de rastreio expirou ou não existe mais.');
        return;
      }
      setLocalizacao(await res.json());
    } catch {
      setErro('Não consegui carregar a localização agora.');
    }
  }

  useEffect(() => {
    buscar();
    const intervalo = setInterval(buscar, 8000);
    return () => clearInterval(intervalo);
  }, []);

  const urlAtual = typeof window !== 'undefined' ? window.location.href : '';
  const textoCompartilhar = localizacao
    ? `Acompanhe a viagem para ${localizacao.viagem.pacote.destino} em tempo real: ${urlAtual}`
    : '';

  async function compartilhar() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Rastreio da viagem', text: textoCompartilhar, url: urlAtual });
        return;
      } catch {
        // usuário cancelou o share nativo — cai pro fallback abaixo
      }
    }
    await navigator.clipboard.writeText(textoCompartilhar);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  }

  if (erro) {
    return (
      <main className="min-h-screen bg-linho flex items-center justify-center px-6 text-center">
        <p className="text-tinta/60 max-w-sm">{erro}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-linho px-6 py-10 flex flex-col items-center">
      <p className="font-display uppercase tracking-wide text-terracota text-sm mb-2">
        Rastreio ao vivo
      </p>
      <h1 className="font-display text-3xl mb-1 text-center">
        {localizacao ? localizacao.viagem.pacote.destino : 'Carregando...'}
      </h1>
      {localizacao && (
        <p className="text-tinta/60 mb-8">
          Atualizado às{' '}
          {new Date(localizacao.registradoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}

      <div className="w-full max-w-2xl aspect-video border border-tinta/15 mb-8 overflow-hidden">
        {localizacao ? (
          <iframe
            title="Mapa de rastreio ao vivo"
            className="w-full h-full border-0"
            src={`https://maps.google.com/maps?q=${localizacao.lat},${localizacao.lng}&z=14&output=embed`}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-tinta/10 flex items-center justify-center">
            <p className="text-tinta/40 text-sm px-6 text-center">Carregando mapa...</p>
          </div>
        )}
      </div>

      <button
        onClick={compartilhar}
        className="bg-estrada hover:bg-estrada-escura transition-colors text-linho font-display px-8 py-3 mb-3"
      >
        Compartilhar com amigos e família
      </button>
      <p className="text-tinta/50 text-sm">
        {copiado ? 'Link copiado! É só colar e mandar pra quem quiser acompanhar.' : 'Qualquer pessoa com esse link acompanha a viagem, sem precisar baixar nada ou criar conta.'}
      </p>
    </main>
  );
}
