'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch, pegarCliente } from '../../../lib/api';

type Reserva = {
  id: string;
  status: string;
  viagem: {
    id: string;
    status: string;
    dataSaida: string;
    localEmbarque: string;
    pacote: { destino: string; nome: string; descricao: string | null; inclui: string | null };
  };
};

type Documento = { id: string; nome: string; urlArquivo: string };
type FotoGaleria = { id: string; tipo: string; urlArquivo: string };
type Mensagem = { id: string; remetente: 'cliente' | 'agencia'; texto: string; criadoEm: string };

export default function DetalheViagem({ params }: { params: { reservaId: string } }) {
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [galeria, setGaleria] = useState<FotoGaleria[]>([]);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [linkRastreio, setLinkRastreio] = useState<string | null>(null);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const cliente = pegarCliente();

  async function carregarTudo() {
    try {
      const r: Reserva = await apiFetch(`/reservas/${params.reservaId}`);
      setReserva(r);

      const [docs, fotos] = await Promise.all([
        apiFetch(`/documentos/viagem/${r.viagem.id}`),
        apiFetch(`/conteudo/viagem/${r.viagem.id}/galeria`),
      ]);
      setDocumentos(docs);
      setGaleria(fotos);

      if (cliente) {
        setMensagens(await apiFetch(`/chat/viagem/${r.viagem.id}/cliente/${cliente.id}`));
      }

      if (r.viagem.status === 'em_andamento') {
        try {
          const rastreio = await apiFetch(`/localizacao/viagens/${r.viagem.id}/link-ativo`);
          setLinkRastreio(rastreio.url);
        } catch {
          // ainda sem GPS ligado pelo motorista
        }
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não consegui carregar essa viagem');
    }
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  async function enviarMensagem(e: React.FormEvent) {
    e.preventDefault();
    if (!novaMensagem.trim() || !reserva || !cliente) return;
    await apiFetch('/chat', {
      method: 'POST',
      body: JSON.stringify({
        viagemId: reserva.viagem.id,
        clienteId: cliente.id,
        remetente: 'cliente',
        texto: novaMensagem,
      }),
    });
    setNovaMensagem('');
    carregarTudo();
  }

  if (erro) return <main className="min-h-screen bg-linho flex items-center justify-center px-6"><p className="text-terracota">{erro}</p></main>;
  if (!reserva) return <main className="min-h-screen bg-linho flex items-center justify-center px-6"><p className="text-tinta/50">Carregando...</p></main>;

  return (
    <main className="min-h-screen bg-linho px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <p className="font-display uppercase tracking-wide text-terracota text-sm mb-1">Área do viajante</p>
        <h1 className="font-display text-3xl mb-1">{reserva.viagem.pacote.destino}</h1>
        <p className="text-tinta/60 mb-8">{reserva.viagem.pacote.nome}</p>

        {linkRastreio && (
          <Link
            href={linkRastreio}
            className="block bg-estrada text-linho font-display text-center py-3 mb-8 hover:bg-estrada-escura transition-colors"
          >
            🚌 Acompanhar viagem ao vivo agora
          </Link>
        )}

        {reserva.viagem.status === 'concluida' && (
          <Link
            href={`/avaliar/${reserva.viagem.id}`}
            className="block border border-estrada text-estrada font-display text-center py-3 mb-8 hover:bg-estrada hover:text-linho transition-colors"
          >
            ⭐ Avaliar essa viagem
          </Link>
        )}

        {/* ROTEIRO */}
        <section className="mb-10">
          <h2 className="font-display text-xl mb-3">Roteiro</h2>
          <p className="text-tinta/70 mb-3">{reserva.viagem.pacote.descricao ?? 'Roteiro a confirmar com a agência.'}</p>
          {reserva.viagem.pacote.inclui && (
            <p className="text-sm text-tinta/50 border-l-2 border-estrada pl-3">{reserva.viagem.pacote.inclui}</p>
          )}
        </section>

        {/* EMBARQUE */}
        <section className="mb-10">
          <h2 className="font-display text-xl mb-3">Embarque</h2>
          <p className="text-tinta/70">
            {new Date(reserva.viagem.dataSaida).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}
          </p>
          <p className="text-tinta/70">{reserva.viagem.localEmbarque}</p>
        </section>

        {/* DOCUMENTOS */}
        <section className="mb-10">
          <h2 className="font-display text-xl mb-3">Documentos e orientações</h2>
          {documentos.length === 0 && <p className="text-tinta/50 text-sm">Nenhum documento publicado ainda.</p>}
          <div className="space-y-2">
            {documentos.map((d) => (
              <a key={d.id} href={d.urlArquivo} target="_blank" className="block text-estrada underline text-sm">
                📄 {d.nome}
              </a>
            ))}
          </div>
        </section>

        {/* GALERIA */}
        <section className="mb-10">
          <h2 className="font-display text-xl mb-3">Galeria da viagem</h2>
          {galeria.length === 0 && <p className="text-tinta/50 text-sm">As fotos aparecem aqui assim que a agência publicar.</p>}
          <div className="grid grid-cols-3 gap-2">
            {galeria.map((f) => (
              <div key={f.id} className="aspect-square bg-tinta/10 flex items-center justify-center text-xs text-tinta/40">
                {f.tipo === 'video' ? '🎥' : '📷'}
              </div>
            ))}
          </div>
        </section>

        {/* CHAT */}
        <section>
          <h2 className="font-display text-xl mb-3">Chat com a agência</h2>
          <div className="border border-tinta/15 p-4 mb-3 max-h-64 overflow-y-auto space-y-2">
            {mensagens.length === 0 && <p className="text-tinta/40 text-sm">Nenhuma mensagem ainda — manda um oi!</p>}
            {mensagens.map((m) => (
              <div key={m.id} className={`text-sm max-w-[80%] p-2 ${m.remetente === 'cliente' ? 'ml-auto bg-estrada/10 text-right' : 'bg-tinta/5'}`}>
                {m.texto}
              </div>
            ))}
          </div>
          <form onSubmit={enviarMensagem} className="flex gap-2">
            <input
              className="flex-1 border border-tinta/20 px-3 py-2 text-sm"
              placeholder="Escreva sua mensagem..."
              value={novaMensagem}
              onChange={(e) => setNovaMensagem(e.target.value)}
            />
            <button className="bg-estrada text-linho font-display px-4 py-2 text-sm">Enviar</button>
          </form>
        </section>
      </div>
    </main>
  );
}
