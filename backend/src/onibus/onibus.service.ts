import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarOnibusDto } from './dto/criar-onibus.dto';

@Injectable()
export class OnibusService {
  constructor(private prisma: PrismaService) {}

  async listar() {
    return this.prisma.onibus.findMany({ where: { ativo: true }, include: { poltronas: true } });
  }

  async buscarPorId(id: string) {
    const onibus = await this.prisma.onibus.findUnique({ where: { id }, include: { poltronas: true } });
    if (!onibus) throw new NotFoundException('Ônibus não encontrado');
    return onibus;
  }

  /** Cria o ônibus e já gera as poltronas numeradas de 1 até a capacidade informada. */
  async criar(dto: CriarOnibusDto) {
    const onibus = await this.prisma.onibus.create({
      data: {
        placa: dto.placa,
        modelo: dto.modelo,
        capacidade: dto.capacidade,
        layoutPoltronas: dto.layoutPoltronas as any,
      },
    });

    await this.prisma.poltrona.createMany({
      data: Array.from({ length: dto.capacidade }, (_, i) => ({
        onibusId: onibus.id,
        numero: String(i + 1).padStart(2, '0'),
        tipo: 'comum',
      })),
    });

    return this.buscarPorId(onibus.id);
  }

  /** Mapa de poltronas de uma viagem específica: quais estão ocupadas/livres pra essa viagem. */
  async mapaDeViagem(viagemId: string) {
    const viagem = await this.prisma.viagem.findUnique({ where: { id: viagemId } });
    if (!viagem || !viagem.onibusId) throw new NotFoundException('Viagem ou ônibus não encontrado');

    const onibus = await this.buscarPorId(viagem.onibusId);
    const reservas = await this.prisma.reserva.findMany({
      where: { viagemId, status: { in: ['confirmada', 'pendente'] } },
      select: { poltronaId: true },
    });
    const ocupadas = new Set(reservas.map((r) => r.poltronaId));

    return {
      onibus: { id: onibus.id, placa: onibus.placa },
      poltronas: onibus.poltronas.map((p) => ({ ...p, ocupada: ocupadas.has(p.id) })),
    };
  }
}
