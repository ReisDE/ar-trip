import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async metricas() {
    const [faturamento, totalReservas, viagensConcluidas, mediaAvaliacao] = await Promise.all([
      this.prisma.pagamento.aggregate({ where: { status: 'aprovado' }, _sum: { valor: true } }),
      this.prisma.reserva.count({ where: { status: 'confirmada' } }),
      this.prisma.viagem.count({ where: { status: 'concluida' } }),
      this.prisma.avaliacao.aggregate({ _avg: { nota: true } }),
    ]);

    return {
      faturamentoTotal: faturamento._sum.valor ?? 0,
      totalReservasConfirmadas: totalReservas,
      viagensConcluidas,
      notaMedia: mediaAvaliacao._avg.nota ?? null,
    };
  }

  /** Faturamento e ocupação por destino — a base do relatório que o Anderson quer exportar. */
  async faturamentoPorDestino() {
    const pacotes = await this.prisma.pacote.findMany({
      include: {
        viagens: {
          include: { reservas: { where: { status: 'confirmada' } } },
        },
      },
    });

    return pacotes.map((pacote) => {
      const totalReservas = pacote.viagens.reduce((acc, v) => acc + v.reservas.length, 0);
      const vagasTotais = pacote.viagens.reduce((acc, v) => acc + v.vagasTotais, 0);
      const faturamento = pacote.viagens.reduce(
        (acc, v) => acc + v.reservas.reduce((soma, r) => soma + Number(r.valorTotal), 0),
        0,
      );
      return {
        destino: pacote.destino,
        pacote: pacote.nome,
        faturamento,
        ocupacaoPercentual: vagasTotais > 0 ? Math.round((totalReservas / vagasTotais) * 100) : 0,
      };
    });
  }
}
