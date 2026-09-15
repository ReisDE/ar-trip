import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarAvaliacaoDto } from './dto/criar-avaliacao.dto';

@Injectable()
export class AvaliacoesService {
  constructor(private prisma: PrismaService) {}

  async criar(dto: CriarAvaliacaoDto) {
    const jaAvaliou = await this.prisma.avaliacao.findFirst({
      where: { viagemId: dto.viagemId, clienteId: dto.clienteId },
    });
    if (jaAvaliou) throw new BadRequestException('Você já avaliou essa viagem');

    return this.prisma.avaliacao.create({ data: dto });
  }

  async listarPorViagem(viagemId: string) {
    return this.prisma.avaliacao.findMany({ where: { viagemId }, orderBy: { criadoEm: 'desc' } });
  }

  async mediaGeral() {
    const resultado = await this.prisma.avaliacao.aggregate({ _avg: { nota: true }, _count: true });
    return { media: resultado._avg.nota ?? 0, total: resultado._count };
  }
}
