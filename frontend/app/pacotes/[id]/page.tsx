import { notFound } from 'next/navigation';
import { CardViagem } from '../../../components/CardViagem';

type Viagem = { id: string; dataSaida: string; dataRetorno: string; localEmbarque: string; vagasTotais: number };
type Pacote = {
  id: string;
  nome: string;
  destino: string;
  descricao: string | null;
  precoBase: number;
  duracaoDias: number;
  inclui: string | null;
  viagens: Viagem[];
};

async function buscarPacote(id: string): Promise<Pacote | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api'}/pacotes/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function formatarPreco(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarDataHora(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default async function PaginaPacote({ params }: { params: { id: string } }) {
  const pacote = await buscarPacote(params.id);
  if (!pacote) notFound();

  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <p className="font-display uppercase tracking-wide text-terracota text-sm mb-2">
        {pacote.duracaoDias} {pacote.duracaoDias === 1 ? 'dia' : 'dias'} de viagem
      </p>
      <h1 className="font-display text-4xl mb-2">{pacote.destino}</h1>
      <p className="text-tinta/60 mb-8">{pacote.nome}</p>

      {pacote.descricao && <p className="mb-8 max-w-2xl leading-relaxed">{pacote.descricao}</p>}

      {pacote.inclui && (
        <div className="mb-10 border-l-2 border-estrada pl-4">
          <p className="font-display uppercase text-xs tracking-wide mb-1">O que está incluso</p>
          <p className="text-tinta/70">{pacote.inclui}</p>
        </div>
      )}

      <h2 className="font-display text-2xl mb-4">Datas disponíveis</h2>
      <div className="space-y-3">
        {pacote.viagens.length === 0 && (
          <p className="text-tinta/50">Nenhuma data agendada no momento.</p>
        )}
        {pacote.viagens.map((viagem) => (
          <div
            key={viagem.id}
            className="flex flex-wrap items-start justify-between gap-4 border border-tinta/15 p-5"
          >
            <div>
              <p className="font-display text-lg">{formatarDataHora(viagem.dataSaida)}</p>
              <p className="text-sm text-tinta/60">Embarque: {viagem.localEmbarque}</p>
            </div>
            <div className="flex flex-wrap items-start gap-4 w-full sm:w-auto justify-end">
              <span className="font-display text-xl text-estrada pt-1">{formatarPreco(Number(pacote.precoBase))}</span>
              <CardViagem viagemId={viagem.id} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
