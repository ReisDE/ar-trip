'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api';

export default function PainelWhatsapp() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [conectado, setConectado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  async function buscarStatus() {
    try {
      const res = await fetch(`${API_URL}/whatsapp/status`);
      const data = await res.json();
      setConectado(data.conectado);
      return data.conectado;
    } catch {
      return false;
    }
  }

  async function buscarQrCode() {
    try {
      setErro(null);
      const res = await fetch(`${API_URL}/whatsapp/qrcode`);
      const data = await res.json();
      if (data.base64) setQrCode(data.base64);
    } catch {
      setErro('Não consegui falar com a Evolution API. Confirme se ela está rodando e se o EVOLUTION_API_URL está certo no .env.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    buscarQrCode();
    const intervalo = setInterval(async () => {
      const ok = await buscarStatus();
      if (ok) {
        clearInterval(intervalo);
      } else {
        buscarQrCode();
      }
    }, 5000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <main className="min-h-screen bg-tinta text-linho flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <p className="font-display uppercase tracking-wide text-poeira text-sm mb-2">
          Conectar WhatsApp
        </p>
        <h1 className="font-display text-3xl mb-6">
          {conectado ? 'WhatsApp conectado!' : 'Escaneie com o celular do Anderson'}
        </h1>

        {conectado ? (
          <div className="border-2 border-estrada bg-estrada/10 p-10">
            <p className="text-linho/80">
              Conexão ativa. Os grupos de viagem já podem mandar fotos e vídeos que caem direto
              no fluxo de aprovação de conteúdo.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-linho p-6 inline-block mb-6">
              {carregando && <p className="text-tinta py-16 px-10">Gerando QR Code...</p>}
              {!carregando && qrCode && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrCode} alt="QR Code para conectar o WhatsApp" width={280} height={280} />
              )}
              {!carregando && !qrCode && !erro && (
                <p className="text-tinta py-16 px-10">Sem QR Code disponível no momento.</p>
              )}
            </div>
            <ol className="text-left text-linho/70 text-sm space-y-1 max-w-xs mx-auto mb-4">
              <li>1. Abra o WhatsApp no celular do Anderson</li>
              <li>2. Toque em Mais opções → Aparelhos conectados</li>
              <li>3. Toque em "Conectar um aparelho"</li>
              <li>4. Aponte a câmera pra esse QR Code</li>
            </ol>
            <p className="text-xs text-linho/40">Atualiza automaticamente a cada 5 segundos</p>
          </>
        )}

        {erro && <p className="mt-6 text-terracota text-sm">{erro}</p>}
      </div>
    </main>
  );
}
