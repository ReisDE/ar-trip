import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EnviarMensagemDto } from './dto/enviar-mensagem.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async enviar(dto: EnviarMensagemDto) {
    return this.prisma.mensagemChat.create({ data: dto });
  }

  async listarConversa(viagemId: string, clienteId: string) {
    return this.prisma.mensagemChat.findMany({
      where: { viagemId, clienteId },
      orderBy: { criadoEm: 'asc' },
    });
  }

  /**
   * Todas as conversas em aberto — usado pelo painel do Anderson pra responder os clientes.
   * Traz a última mensagem de cada par (viagem + cliente).
   * Nota: `findMany` com `distinct: ['viagemId','clienteId']` + include quebra no Postgres
   * (DISTINCT ON exige order by nas colunas distintas), então agrupamos em memória.
   */
  async listarConversasAbertas() {
    const mensagens = await this.prisma.mensagemChat.findMany({
      orderBy: { criadoEm: 'desc' },
      include: { cliente: true, viagem: { include: { pacote: true } } },
      take: 500,
    });

    const porPar = new Map<string, (typeof mensagens)[number]>();
    for (const mensagem of mensagens) {
      const chave = `${mensagem.viagemId}:${mensagem.clienteId}`;
      if (!porPar.has(chave)) porPar.set(chave, mensagem);
    }

    return [...porPar.values()];
  }
}
