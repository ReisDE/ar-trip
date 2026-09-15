import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Integração com a Evolution API (self-hosted) para conectar o WhatsApp
 * do Anderson via QR Code. Depois de conectado, os grupos das viagens
 * passam a mandar mídia direto pro fluxo do módulo de Conteúdo.
 */
@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly instanceName = 'ar-trip';

  constructor(private config: ConfigService) {
    this.baseUrl = this.config.get<string>('EVOLUTION_API_URL') ?? 'http://localhost:8080';
    this.apiKey = this.config.get<string>('EVOLUTION_API_KEY') ?? '';
  }

  private headers() {
    return { 'Content-Type': 'application/json', apikey: this.apiKey };
  }

  /** Cria a instância (idempotente na prática — a Evolution API retorna erro se já existir, que ignoramos). */
  private async garantirInstancia() {
    try {
      await fetch(`${this.baseUrl}/instance/create`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({
          instanceName: this.instanceName,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS',
        }),
      });
    } catch (e) {
      this.logger.warn(`Instância já existe ou falhou ao criar: ${e}`);
    }
  }

  /** Retorna o QR Code em base64 pronto pra exibir na tela do Anderson. */
  async gerarQrCode(): Promise<{ base64: string | null; pareado: boolean }> {
    await this.garantirInstancia();

    const res = await fetch(`${this.baseUrl}/instance/connect/${this.instanceName}`, {
      method: 'GET',
      headers: this.headers(),
    });

    if (!res.ok) {
      return { base64: null, pareado: false };
    }

    const data = await res.json();
    // A Evolution API retorna { base64, pairingCode } quando ainda não conectado,
    // ou informação de instância já conectada quando o pareamento já foi feito.
    return { base64: data.base64 ?? null, pareado: !data.base64 };
  }

  /** Estado da conexão — usado pelo frontend pra saber quando parar de mostrar o QR e liberar o painel. */
  async statusConexao(): Promise<{ conectado: boolean; estado: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/instance/connectionState/${this.instanceName}`, {
        headers: this.headers(),
      });
      if (!res.ok) return { conectado: false, estado: 'desconhecido' };
      const data = await res.json();
      const estado = data?.instance?.state ?? data?.state ?? 'close';
      return { conectado: estado === 'open', estado };
    } catch {
      return { conectado: false, estado: 'erro' };
    }
  }

  /** Envia uma mensagem de texto simples via Evolution API (link de rastreio, avisos de lista de espera, etc). */
  async enviarMensagem(telefone: string, texto: string) {
    try {
      const res = await fetch(`${this.baseUrl}/message/sendText/${this.instanceName}`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({ number: telefone, text: texto }),
      });
      if (!res.ok) {
        this.logger.warn(`Falha ao enviar WhatsApp pra ${telefone}: ${await res.text()}`);
        return false;
      }
      return true;
    } catch (e) {
      this.logger.warn(`Erro ao enviar WhatsApp pra ${telefone}: ${e}`);
      return false;
    }
  }
}
