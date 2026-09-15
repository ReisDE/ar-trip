import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarPacoteDto } from './dto/criar-pacote.dto';

@Injectable()
export class PacotesService {
  constructor(private prisma: PrismaService) {}

  async listar(filtros: { destino?: string; precoMax?: number }) {
    return this.prisma.pacote.findMany({
      where: {
        ativo: true,
        destino: filtros.destino ? { contains: filtros.destino, mode: 'insensitive' } : undefined,
        precoBase: filtros.precoMax ? { lte: filtros.precoMax } : undefined,
      },
      include: {
        viagens: {
          where: { status: 'agendada' },
          orderBy: { dataSaida: 'asc' },
        },
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async buscarPorId(id: string) {
    const pacote = await this.prisma.pacote.findUnique({
      where: { id },
      include: {
        viagens: { where: { status: 'agendada' }, orderBy: { dataSaida: 'asc' } },
        conteudos: { where: { status: 'publicado' }, take: 12 },
      },
    });
    if (!pacote) throw new NotFoundException('Pacote não encontrado');
    return pacote;
  }

  async criar(dto: CriarPacoteDto) {
    return this.prisma.pacote.create({ data: dto });
  }
}
