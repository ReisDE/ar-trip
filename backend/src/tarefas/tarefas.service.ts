import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Jobs agendados. Requer @nestjs/schedule (já listado no package.json)
 * e ScheduleModule.forRoot() importado no AppModule.
 */
@Injectable()
export class TarefasService {
  private readonly logger = new Logger(TarefasService.name);

  constructor(private prisma: PrismaService) {}

  /** Roda a cada 30 minutos: expira o rastreio de viagens concluídas há mais de 6 horas. */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async expirarRastreiosAntigos() {
    const limite = new Date(Date.now() - 6 * 60 * 60 * 1000);

    const viagensParaExpirar = await this.prisma.viagem.findMany({
      where: { status: 'concluida', dataRetorno: { lte: limite } },
      select: { id: true },
    });

    if (viagensParaExpirar.length === 0) return;

    await this.prisma.localizacao.updateMany({
      where: { viagemId: { in: viagensParaExpirar.map((v) => v.id) }, expirado: false },
      data: { expirado: true },
    });

    this.logger.log(`Expirei o rastreio de ${viagensParaExpirar.length} viagem(ns) concluída(s).`);
  }
}
