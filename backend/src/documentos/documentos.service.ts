import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarDocumentoDto } from './dto/criar-documento.dto';

@Injectable()
export class DocumentosService {
  constructor(private prisma: PrismaService) {}

  async criar(dto: CriarDocumentoDto) {
    return this.prisma.documentoViagem.create({ data: dto });
  }

  async listarPorViagem(viagemId: string) {
    return this.prisma.documentoViagem.findMany({ where: { viagemId }, orderBy: { criadoEm: 'desc' } });
  }
}
