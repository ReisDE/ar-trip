'use client';

import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../../lib/api';

const MP_PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY ?? '';

type Reserva = {
  id: string;
  valorTotal: number;
  status: string;
  viagem: { pacote: { destino: string; nome: string }; dataSaida: string };
};

type CobrancaPix = { qrCodeBase64: string | null; copiaECola: string | null };
type CobrancaBoleto = { urlBoleto: string | null; codigoBarras: string | null; vencimento: string | null };

type Metodo = 'pix' | 'boleto' | 'cartao';

export default function Checkout({ params }: { params: { reservaId: string } }) {
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [metodo, setMetodo] = useState<Metodo>('pix');
  const [pix, setPix] = useState<CobrancaPix | null>(null);
  const [boleto, setBoleto] = useState<CobrancaBoleto | null>(null);
  const [confirmado, setConfirmado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const bricksCriadoRef = useRef(false);
  const sdkCarregadoRef = useRef(false);

  async function gerarCobranca(m: Metodo) {
    setErro(null);
    try {
      if (m === 'pix') setPix(await apiFetch('/pagamentos/pix', { method: 'POST', body: JSON.stringify({ reservaId: params.reservaId }) }));
      if (m === 'boleto') setBoleto(await apiFetch('/pagamentos/boleto', { method: 'POST', body: JSON.stringify({ reservaId: params.reservaId }) }));
    } catch (err) {
      setErro(
        err instanceof Error
          ? err.message
          : 'Não consegui gerar a cobrança. Confira se o MERCADOPAGO_ACCESS_TOKEN está configurado no backend.',
      );
    }
  }

  async function carregarReserva() {
    try {
      const dados = await apiFetch(`/reservas/${params.reservaId}`);
      setReserva(dados);
      if (dados.status === 'confirmada') setConfirmado(true);
    } catch {
      setErro('Não encontrei essa reserva.');
    }
  }

  useEffect(() => {
    carregarReserva();
    gerarCobranca('pix');
  }, []);

  useEffect(() => {
    if (confirmado) return;
    const intervalo = setInterval(async () => {
      try {
        const status = await apiFetch(`/pagamentos/${params.reservaId}/status`);
        if (status.status === 'aprovado') {
          setConfirmado(true);
          clearInterval(intervalo);
        }
      } catch {
        // ainda sem pagamento gerado, tenta de novo no próximo ciclo
      }
    }, 4000);
    return () => clearInterval(intervalo);
  }, [confirmado, params.reservaId]);

  function trocarMetodo(m: Metodo) {
    setMetodo(m);
    if (m === 'pix' && !pix) gerarCobranca('pix');
    if (m === 'boleto' && !boleto) gerarCobranca('boleto');
  }

  // Cartão: carrega o SDK oficial do Mercado Pago e cria o Payment Brick
  // (tokeniza o cartão no navegador — os dados nunca passam pelo backend).
  // Só roda quando NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY estiver configurada.
  useEffect(() => {
    if (metodo !== 'cartao' || !MP_PUBLIC_KEY || !reserva || confirmado || bricksCriadoRef.current) return;

    function criarBrick() {
      const mp = new (window as any).MercadoPago(MP_PUBLIC_KEY);
      mp.bricks()
        .create('payment', 'bricks-payment', {
          initialization: {
            amount: Number(reserva.valorTotal),
            payer: { email: 'cliente@artrip.com.br' },
          },
          customAction: { callbacks: { onReady: () => {}, onError: (e: any) => setErro(e?.message ?? 'Erro no cartão') } },
          callbacks: {
            onSubmit: async (formData: any) => {
              setErro(null);
              try {
                await apiFetch('/pagamentos/cartao', {
                  method: 'POST',
                  body: JSON.stringify({
                    reservaId: params.reservaId,
                    tokenCartao: formData.token,
                    parcelas: Number(formData.installments ?? 1),
                  }),
                });
              } catch (err) {
                setErro(err instanceof Error ? err.message : 'Não consegui processar o cartão');
              }
            },
            onError: (e: any) => setErro(e?.message ?? 'Erro no cartão'),
          },
          customization: { visual: { style: { theme: 'default' } } },
        })
        .then(() => {
          bricksCriadoRef.current = true;
        })
        .catch((e: any) => setErro(e?.message ?? 'Não consegui carregar o cartão'));
    }

    if (sdkCarregadoRef.current || (window as any).MercadoPago) {
      sdkCarregadoRef.current = true;
      criarBrick();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.onload = () => {
      sdkCarregadoRef.current = true;
      criarBrick();
    };
    script.onerror = () => setErro('Não consegui carregar o Mercado Pago Bricks. Confira sua conexão.');
    document.head.appendChild(script);
  }, [metodo, reserva, confirmado, params.reservaId]);

  function copiarCodigo() {
    if (!pix?.copiaECola) return;
    navigator.clipboard.writeText(pix.copiaECola);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  }

  if (confirmado) {
    return (
      <main className="min-h-screen bg-linho flex items-center justify-center px-6 text-center">
        <div>
          <p className="font-display uppercase tracking-wide text-estrada text-sm mb-2">Pagamento confirmado</p>
          <h1 className="font-display text-3xl mb-4">Reserva garantida!</h1>
          <p className="text-tinta/60 max-w-sm">
            Já mandamos a confirmação e os detalhes da viagem. Assim que o motorista ligar o GPS no
            dia, você recebe o link de rastreio ao vivo.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-linho flex flex-col items-center px-6 py-14">
      <p className="font-display uppercase tracking-wide text-terracota text-sm mb-2">Pagamento</p>
      <h1 className="font-display text-3xl mb-1 text-center">
        {reserva ? reserva.viagem.pacote.destino : 'Carregando...'}
      </h1>
      {reserva && (
        <p className="font-display text-2xl text-estrada mb-6">
          {Number(reserva.valorTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
      )}

      <div className="flex gap-2 mb-8">
        {(['pix', 'boleto', 'cartao'] as Metodo[]).map((m) => (
          <button
            key={m}
            onClick={() => trocarMetodo(m)}
            className={`px-4 py-2 font-display text-sm capitalize ${metodo === m ? 'bg-estrada text-linho' : 'border border-tinta/20 text-tinta/60'}`}
          >
            {m}
          </button>
        ))}
      </div>

      {erro && <p className="text-terracota text-sm mb-6 max-w-sm text-center">{erro}</p>}

      {metodo === 'pix' && (
        <>
          {pix?.qrCodeBase64 ? (
            <div className="bg-white p-6 mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`data:image/png;base64,${pix.qrCodeBase64}`} alt="QR Code Pix" width={260} height={260} />
            </div>
          ) : (
            !erro && <p className="text-tinta/60 mb-6">Gerando QR Code Pix...</p>
          )}
          {pix?.copiaECola && (
            <button
              onClick={copiarCodigo}
              className="border border-estrada text-estrada font-display px-6 py-2 hover:bg-estrada hover:text-linho transition-colors mb-4"
            >
              {copiado ? 'Código copiado!' : 'Copiar código Pix (copia e cola)'}
            </button>
          )}
        </>
      )}

      {metodo === 'boleto' && (
        <div className="text-center mb-6">
          {boleto?.urlBoleto ? (
            <>
              <a
                href={boleto.urlBoleto}
                target="_blank"
                className="inline-block bg-estrada text-linho font-display px-8 py-3 mb-3"
              >
                Abrir boleto (PDF)
              </a>
              {boleto.codigoBarras && (
                <p className="text-xs text-tinta/50 break-all max-w-sm">{boleto.codigoBarras}</p>
              )}
              {boleto.vencimento && (
                <p className="text-sm text-tinta/60 mt-2">
                  Vence em {new Date(boleto.vencimento).toLocaleDateString('pt-BR')}
                </p>
              )}
            </>
          ) : (
            !erro && <p className="text-tinta/60">Gerando boleto...</p>
          )}
        </div>
      )}

      {metodo === 'cartao' && (
        <div className="text-center mb-6 max-w-sm w-full">
          {MP_PUBLIC_KEY ? (
            <>
              <div id="bricks-payment" className="mb-4" />
              {!erro && <p className="text-tinta/60 text-sm">Formulário seguro do Mercado Pago carregando...</p>}
            </>
          ) : (
            <p className="text-tinta/60 text-sm">
              O pagamento por cartão usa o componente oficial do Mercado Pago (Bricks), que tokeniza o
              cartão direto no navegador — os dados nunca passam pelo nosso servidor. Para ativar na
              demo, defina <code>NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY</code> no <code>.env</code> do
              frontend (veja o README). O endpoint <code>POST /api/pagamentos/cartao</code> já está
              pronto pra receber o token gerado por ele.
            </p>
          )}
        </div>
      )}

      <p className="text-tinta/50 text-sm text-center max-w-xs">
        Assim que o pagamento cair, essa página confirma sozinha — não precisa recarregar.
      </p>
    </main>
  );
}
