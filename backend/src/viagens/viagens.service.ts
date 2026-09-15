import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarViagemDto } from './dto/criar-viagem.dto';

@Injectable()
export class ViagensService {
  constructor(private prisma: PrismaService) {}

  async listarDoDia(data: Date = new Date()) {
    const inicio = new Date(data);
    inicio.setHours(0, 0, 0, 0);
    const fim = new Date(data);
    fim.setHours(23, 59, 59, 999);

    return this.prisma.viagem.findMany({
      where: { dataSaida: { gte: inicio, lte: fim } },
      include: { pacote: true, motorista: true, guia: true },
      orderBy: { dataSaida: 'asc' },
    });
  }

  async buscarPorId(id: string) {
    const viagem = await this.prisma.viagem.findUnique({
      where: { id },
      include: { pacote: true, onibus: { include: { poltronas: true } }, reservas: true },
    });
    if (!viagem) throw new NotFoundException('Viagem não encontrada');
    return viagem;
  }

  async criar(dto: CriarViagemDto) {
    return this.prisma.viagem.create({
      data: {
        pacoteId: dto.pacoteId,
        dataSaida: new Date(dto.dataSaida),
        dataRetorno: new Date(dto.dataRetorno),
        onibusId: dto.onibusId,
        motoristaId: dto.motoristaId,
        guiaId: dto.guiaId,
        localEmbarque: dto.localEmbarque,
        vagasTotais: dto.vagasTotais,
      },
    });
  }

  /** Vagas realmente livres = total - (confirmadas + pendentes) */
  async vagasDisponiveis(viagemId: string) {
    const viagem = await this.buscarPorId(viagemId);
    const ocupadas = await this.prisma.reserva.count({
      where: { viagemId, status: { in: ['confirmada', 'pendente'] } },
    });
    return Math.max(viagem.vagasTotais - ocupadas, 0);
  }

  async iniciarViagem(id: string) {
    return this.prisma.viagem.update({ where: { id }, data: { status: 'em_andamento' } });
  }

  /** Encerra a viagem e credita pontos de fidelidade pra quem viajou (10 pontos por real gasto). */
  async encerrarViagem(id: string) {
    const viagem = await this.prisma.viagem.update({ where: { id }, data: { status: 'concluida' } });

    const reservas = await this.prisma.reserva.findMany({
      where: { viagemId: id, status: 'confirmada' },
      include: { cliente: true },
    });

    await Promise.all(
      reservas.map(async (reserva) => {
        const pontos = Math.round(Number(reserva.valorTotal) * 10);
        await this.prisma.cliente.update({
          where: { id: reserva.clienteId },
          data: { pontosFidelidade: { increment: pontos } },
        });

        // Quem indicou também ganha um bônus de fidelidade (metade dos pontos).
        if (reserva.cliente.indicadoPorId) {
          await this.prisma.cliente.update({
            where: { id: reserva.cliente.indicadoPorId },
            data: { pontosFidelidade: { increment: Math.round(pontos / 2) } },
          });
        }
      }),
    );

    return viagem;
  }
}
