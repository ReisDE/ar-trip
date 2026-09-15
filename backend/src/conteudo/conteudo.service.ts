import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AprovarConteudoDto } from './dto/aprovar-conteudo.dto';

@Injectable()
export class ConteudoService {
  private readonly logger = new Logger(ConteudoService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  /**
   * Chamado pelo webhook da Evolution API quando chega mídia num grupo de viagem.
   * `grupoWhatsappId` deve estar mapeado pra uma viagem (via Grupo.linkToken ou
   * um campo próprio — aqui simplificamos recebendo o viagemId direto, que é
   * resolvido no controller/webhook a partir do JID do grupo).
   */
  async receberMidia(params: { viagemId?: string; pacoteId?: string; tipo: 'foto' | 'video'; urlArquivo: string }) {
    // Descobre o destino pra enriquecer a legenda gerada por IA.
    let destino: string | undefined;
    if (params.viagemId) {
      const viagem = await this.prisma.viagem.findUnique({
        where: { id: params.viagemId },
        include: { pacote: true },
      });
      destino = viagem?.pacote?.destino;
    } else if (params.pacoteId) {
      const pacote = await this.prisma.pacote.findUnique({ where: { id: params.pacoteId } });
      destino = pacote?.destino;
    }

    const legendaGerada = await this.gerarLegenda({ tipo: params.tipo, destino });

    return this.prisma.conteudo.create({
      data: {
        viagemId: params.viagemId,
        pacoteId: params.pacoteId,
        tipo: params.tipo,
        urlArquivo: params.urlArquivo,
        legendaGerada,
        status: 'pendente_aprovacao',
      },
    });
  }

  /**
   * Gera a legenda chamando a API de IA de verdade (Anthropic Claude ou OpenAI).
   * Sem nenhuma chave configurada — ou em caso de falha — cai num texto padrão
   * pra nunca travar o fluxo na demo.
   */
  private async gerarLegenda(params: { tipo: 'foto' | 'video'; destino?: string }): Promise<string> {
    const tipoTexto = params.tipo === 'video' ? 'vídeo' : 'foto';
    const destino = params.destino ? ` de um ônibus viajando para ${params.destino}` : ' de uma viagem de ônibus';
    const prompt =
      `Escreva uma legenda curta em português do Brasil para uma ${tipoTexto}${destino}. ` +
      `Tom alegre e convidativo, no máximo 2 frases, terminando com 2-3 hashtags relevantes ao destino. ` +
      `Responda apenas com a legenda, sem aspas.`;

    const chaveClaude = this.config.get<string>('CLAUDE_API_KEY');
    const chaveOpenAI = this.config.get<string>('OPENAI_API_KEY');

    try {
      if (chaveClaude) {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-api-key': chaveClaude,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-5-haiku-latest',
            max_tokens: 150,
            messages: [{ role: 'user', content: prompt }],
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const texto = data?.content?.[0]?.text?.trim();
          if (texto) return texto;
        }
      }

      if (chaveOpenAI) {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${chaveOpenAI}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 150,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const texto = data?.choices?.[0]?.message?.content?.trim();
          if (texto) return texto;
        }
      }
    } catch (e) {
      this.logger.warn(`Falha ao gerar legenda via IA: ${e}`);
    }

    return params.tipo === 'video'
      ? `Mais um momento incrível dessa viagem${params.destino ? ` para ${params.destino}` : ''}! 🚌✨ #ARTrip`
      : `Registro dessa viagem inesquecível${params.destino ? ` para ${params.destino}` : ''} 📸 #ARTrip`;
  }

  async listarPendentes() {
    return this.prisma.conteudo.findMany({
      where: { status: 'pendente_aprovacao' },
      include: { viagem: { include: { pacote: true } }, pacote: true },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async aprovar(id: string, dto: AprovarConteudoDto) {
    const conteudo = await this.prisma.conteudo.findUnique({ where: { id } });
    if (!conteudo) throw new NotFoundException('Conteúdo não encontrado');

    return this.prisma.conteudo.update({
      where: { id },
      data: {
        status: 'aprovado',
        legendaFinal: dto.legendaFinal ?? conteudo.legendaGerada,
      },
    });
  }

  async rejeitar(id: string) {
    return this.prisma.conteudo.update({ where: { id }, data: { status: 'rejeitado' } });
  }

  /** Publica nas redes. Sem as chaves das redes configuradas, só marca como publicado e loga. */
  async publicar(id: string) {
    const conteudo = await this.prisma.conteudo.findUnique({ where: { id } });
    if (!conteudo) throw new NotFoundException('Conteúdo não encontrado');
    if (conteudo.status !== 'aprovado') throw new BadRequestException('Aprove o conteúdo antes de publicar');

    const redes = ['instagram', 'facebook', 'tiktok', 'site'];
    this.logger.log(`Publicando conteúdo ${id} em: ${redes.join(', ')} (integração real de cada rede a implementar)`);

    return this.prisma.conteudo.update({
      where: { id },
      data: {
        status: 'publicado',
        publicadoEm: redes.reduce((acc, rede) => ({ ...acc, [rede]: new Date().toISOString() }), {}),
      },
    });
  }

  /** Galeria pública de uma viagem — só fotos já publicadas. */
  async galeriaDaViagem(viagemId: string) {
    return this.prisma.conteudo.findMany({ where: { viagemId, status: 'publicado' } });
  }
}
