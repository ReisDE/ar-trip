import Link from 'next/link';

type Pacote = {
  id: string;
  nome: string;
  destino: string;
  precoBase: number;
  duracaoDias: number;
  viagens: { id: string; dataSaida: string }[];
};

async function buscarPacotes(): Promise<Pacote[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api'}/pacotes`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

function formatarPreco(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default async function Home() {
  const pacotes = await buscarPacotes();

  return (
    <main>
      {/* HERO — bilhete de viagem: origem -> destino numa linha pontilhada */}
      <section className="bg-tinta text-linho">
        <div className="mx-auto max-w-6xl px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="font-display uppercase tracking-wide text-poeira text-sm mb-3">
              Planaltina, GO — origem de toda viagem
            </p>
            <h1 className="font-display text-5xl md:text-6xl leading-[1.05] mb-6">
              O ônibus sai.<br />Você só precisa embarcar.
            </h1>
            <div className="flex items-center gap-3 text-linho/80 mb-8 max-w-md">
              <span className="font-display text-lg">AQUI</span>
              <span className="flex-1 rota-pontilhada" style={{ backgroundImage: 'radial-gradient(circle, #F6F1E7 1.5px, transparent 1.5px)' }} />
              <span className="font-display text-lg">SEU DESTINO</span>
            </div>
            <p className="text-linho/70 max-w-md mb-8">
              Reserve online, acompanhe o ônibus em tempo real e receba tudo — roteiro, embarque e
              fotos da viagem — num só lugar.
            </p>
            <Link
              href="#pacotes"
              className="inline-block bg-estrada hover:bg-estrada-escura transition-colors text-linho font-display px-8 py-3 text-lg"
            >
              Ver pacotes disponíveis
            </Link>
          </div>
          <div className="hidden md:block aspect-[4/5] bg-estrada/20 border border-poeira/30" />
        </div>
      </section>

      {/* CATÁLOGO */}
      <section id="pacotes" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-3xl mb-2">Próximas viagens</h2>
        <p className="text-tinta/60 mb-10">Escolha o destino, garanta a poltrona.</p>

        {pacotes.length === 0 ? (
          <div className="border border-tinta/15 p-8 text-tinta/60">
            Nenhum pacote disponível no momento. Assim que a API estiver rodando com dados
            cadastrados, os pacotes aparecem aqui automaticamente.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pacotes.map((pacote) => (
              <Link
                key={pacote.id}
                href={`/pacotes/${pacote.id}`}
                className="group border border-tinta/15 hover:border-estrada transition-colors"
              >
                <div className="aspect-[4/3] bg-tinta/5 group-hover:bg-estrada/10 transition-colors" />
                <div className="p-5">
                  <p className="font-display uppercase text-xs tracking-wide text-terracota mb-1">
                    {pacote.duracaoDias} {pacote.duracaoDias === 1 ? 'dia' : 'dias'}
                  </p>
                  <h3 className="font-display text-xl mb-1">{pacote.destino}</h3>
                  <p className="text-sm text-tinta/60 mb-4">{pacote.nome}</p>
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-2xl text-estrada">
                      {formatarPreco(Number(pacote.precoBase))}
                    </span>
                    {pacote.viagens[0] && (
                      <span className="text-xs text-tinta/50">
                        saída {formatarData(pacote.viagens[0].dataSaida)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
