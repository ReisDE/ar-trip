import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ViagensService } from '../viagens/viagens.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { CriarReservaDto } from './dto/criar-reserva.dto';

@Injectable()
export class ReservasService {
  constructor(
    private prisma: PrismaService,
    private viagensService: ViagensService,
    private whatsappService: WhatsappService,
  ) {}

  /**
   * Cria a reserva como "pendente". Ela só vira "confirmada" quando o
   * webhook do gateway de pagamento confirmar o pagamento (nunca confiamos
   * só no retorno do frontend).
   * Se não houver vaga, a reserva entra automaticamente na lista de espera.
   */
  async criar(dto: CriarReservaDto) {
    const viagem = await this.viagensService.buscarPorId(dto.viagemId);
    if (!viagem) throw new NotFoundException('Viagem não encontrada');

    // Valida a poltrona, se informada: existe, pertence ao ônibus da viagem e ainda está livre.
    if (dto.poltronaId) {
      const poltrona = await this.prisma.poltrona.findUnique({ where: { id: dto.poltronaId } });
      if (!poltrona) throw new BadRequestException('Poltrona não encontrada');
      if (viagem.onibus && poltrona.onibusId !== viagem.onibus.id) {
        throw new BadRequestException('Essa poltrona não pertence ao ônibus dessa viagem');
      }
      const jaOcupada = await this.prisma.reserva.findFirst({
        where: { viagemId: dto.viagemId, poltronaId: dto.poltronaId, status: { in: ['confirmada', 'pendente'] } },
      });
      if (jaOcupada) throw new BadRequestException('Essa poltrona acabou de ser escolhida');
    }

    const vagas = await this.viagensService.vagasDisponiveis(dto.viagemId);
    const pacote = await this.prisma.pacote.findUnique({ where: { id: viagem.pacoteId } });
    if (!pacote) throw new NotFoundException('Pacote da viagem não encontrado');

    const status = vagas > 0 ? 'pendente' : 'lista_espera';

    return this.prisma.reserva.create({
      data: {
        viagemId: dto.viagemId,
        clienteId: dto.clienteId,
        poltronaId: dto.poltronaId,
        status,
        valorTotal: pacote.precoBase,
      },
    });
  }

  async confirmarPagamento(reservaId: string) {
    const reserva = await this.prisma.reserva.findUnique({ where: { id: reservaId } });
    if (!reserva) throw new NotFoundException('Reserva não encontrada');
    if (reserva.status === 'lista_espera') {
      throw new BadRequestException('Reserva está em lista de espera, sem vaga confirmada');
    }
    if (reserva.status === 'confirmada') return reserva;

    const reservaConfirmada = await this.prisma.reserva.update({
      where: { id: reservaId },
      data: { status: 'confirmada' },
    });

    // Mantém o contador de vagas ocupadas coerente (antes nunca era atualizado).
    await this.prisma.viagem.update({
      where: { id: reserva.viagemId },
      data: { vagasOcupadas: { increment: 1 } },
    });

    return reservaConfirmada;
  }

  async cancelar(reservaId: string) {
    const reservaAtual = await this.prisma.reserva.findUnique({ where: { id: reservaId } });
    if (!reservaAtual) throw new NotFoundException('Reserva não encontrada');

    const reserva = await this.prisma.reserva.update({
      where: { id: reservaId },
      data: { status: 'cancelada' },
    });

    // Libera a vaga no contador se a reserva já estava confirmada.
    if (reservaAtual.status === 'confirmada') {
      await this.prisma.viagem.update({
        where: { id: reserva.viagemId },
        data: { vagasOcupadas: { decrement: 1 } },
      });
    }

    // Promove o próximo da lista de espera, se houver, e avisa via WhatsApp.
    const proximo = await this.prisma.reserva.findFirst({
      where: { viagemId: reserva.viagemId, status: 'lista_espera' },
      orderBy: { criadoEm: 'asc' },
      include: { cliente: true },
    });
    if (proximo) {
      await this.prisma.reserva.update({ where: { id: proximo.id }, data: { status: 'pendente' } });
      await this.whatsappService.enviarMensagem(
        proximo.cliente.telefone,
        'Boa notícia! Abriu uma vaga na viagem que você estava na lista de espera. Acesse o site pra confirmar o pagamento e garantir seu lugar.',
      );
    }

    return reserva;
  }

  async listarPorCliente(clienteId: string) {
    return this.prisma.reserva.findMany({
      where: { clienteId },
      include: { viagem: { include: { pacote: true } }, pagamento: true },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async buscarPorId(id: string) {
    const reserva = await this.prisma.reserva.findUnique({
      where: { id },
      include: { viagem: { include: { pacote: true } }, pagamento: true, cliente: true },
    });
    if (!reserva) throw new NotFoundException('Reserva não encontrada');
    return reserva;
  }
}
