import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ViagensService } from '../viagens/viagens.service';
import { MarcarItemDto } from './dto/marcar-item.dto';

type ItemChecklist = { id: string; texto: string; concluido: boolean };

const TEMPLATE_PADRAO: ItemChecklist[] = [
  { id: 'documentos', texto: 'Documentos do ônibus e do motorista em dia', concluido: false },
  { id: 'combustivel', texto: 'Tanque abastecido', concluido: false },
  { id: 'pneus', texto: 'Pneus e estepe verificados', concluido: false },
  { id: 'extintor', texto: 'Extintor e kit de primeiros socorros a bordo', concluido: false },
  { id: 'lista_passageiros', texto: 'Lista de passageiros confirmada', concluido: false },
  { id: 'bagagens', texto: 'Bagagens conferidas e embarcadas', concluido: false },
];

@Injectable()
export class ChecklistService {
  constructor(
    private prisma: PrismaService,
    private viagensService: ViagensService,
  ) {}

  /** Cria (ou retorna, se já existir) o checklist da viagem com o template padrão. */
  async buscarOuCriar(viagemId: string) {
    const existente = await this.prisma.checklistViagem.findUnique({ where: { viagemId } });
    if (existente) return existente;

    return this.prisma.checklistViagem.create({
      data: { viagemId, itens: TEMPLATE_PADRAO, completo: false },
    });
  }

  async marcarItem(viagemId: string, dto: MarcarItemDto) {
    const checklist = await this.buscarOuCriar(viagemId);
    const itens = (checklist.itens as ItemChecklist[]).map((item) =>
      item.id === dto.itemId ? { ...item, concluido: dto.concluido } : item,
    );
    const completo = itens.every((item) => item.concluido);

    return this.prisma.checklistViagem.update({
      where: { viagemId },
      data: { itens, completo, completadoEm: completo ? new Date() : null },
    });
  }

  /** Só libera a viagem como "em andamento" se o checklist estiver 100% completo. */
  async liberarViagem(viagemId: string) {
    const checklist = await this.prisma.checklistViagem.findUnique({ where: { viagemId } });
    if (!checklist || !checklist.completo) {
      throw new BadRequestException('Complete o checklist de saída antes de liberar a viagem');
    }
    return this.viagensService.iniciarViagem(viagemId);
  }
}
