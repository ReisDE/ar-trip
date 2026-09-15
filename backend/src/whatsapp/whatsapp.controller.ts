import { Controller, Get, Post, Body } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { ConteudoService } from '../conteudo/conteudo.service';
import { UploadsService } from '../uploads/uploads.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly conteudoService: ConteudoService,
    private readonly uploadsService: UploadsService,
  ) {}

  @Get('qrcode')
  gerarQrCode() {
    return this.whatsappService.gerarQrCode();
  }

  @Get('status')
  status() {
    return this.whatsappService.statusConexao();
  }

  /**
   * Webhook público que a Evolution API chama sempre que chega uma mensagem.
   * Configurar em: Evolution API → Webhook → eventos "messages.upsert".
   * O payload real varia por versão; esse formato cobre o mais comum
   * (mensagem de imagem/vídeo dentro de um grupo de viagem).
   */
  @Post('webhook')
  async webhook(@Body() body: any) {
    const mensagem = body?.data ?? body;
    const tipoMidia = mensagem?.message?.imageMessage
      ? 'foto'
      : mensagem?.message?.videoMessage
        ? 'video'
        : null;

    if (!tipoMidia) return { ok: true, ignorado: true };

    // O grupo do WhatsApp precisa estar mapeado pra uma viagem — isso é feito
    // guardando o JID do grupo no cadastro da viagem (campo a adicionar) ou
    // usando o link de Grupo já existente. Aqui deixamos o viagemId como
    // opcional pra não travar o recebimento enquanto esse mapeamento não
    // estiver plugado.
    const viagemId = mensagem?.viagemId ?? undefined;
    const urlArquivo = mensagem?.message?.imageMessage?.url ?? mensagem?.message?.videoMessage?.url ?? '';

    // Tenta baixar a mídia pra pasta local de uploads. Se falhar, mantém a URL original.
    const urlLocal = await this.uploadsService.baixarMidia(urlArquivo).catch(() => null);

    await this.conteudoService.receberMidia({ viagemId, tipo: tipoMidia, urlArquivo: urlLocal ?? urlArquivo });
    return { ok: true };
  }
}
