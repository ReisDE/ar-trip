import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CriarGrupoDto } from './dto/criar-grupo.dto';
import { EntrarGrupoDto } from './dto/entrar-grupo.dto';

@Injectable()
export class GruposService {
  constructor(private prisma: PrismaService) {}

  async criar(dto: CriarGrupoDto) {
    return this.prisma.grupo.create({
      data: { viagemId: dto.viagemId, nome: dto.nome, linkToken: randomBytes(8).toString('hex') },
    });
  }

  async buscarPorToken(linkToken: string) {
    const grupo = await this.prisma.grupo.findUnique({
      where: { linkToken },
      include: { viagem: { include: { pacote: true } }, membros: { include: { cliente: true } } },
    });
    if (!grupo) throw new NotFoundException('Grupo não encontrado');
    return grupo;
  }

  async entrar(linkToken: string, dto: EntrarGrupoDto) {
    const grupo = await this.buscarPorToken(linkToken);
    return this.prisma.grupoMembro.upsert({
      where: { grupoId_clienteId: { grupoId: grupo.id, clienteId: dto.clienteId } },
      create: { grupoId: grupo.id, clienteId: dto.clienteId },
      update: {},
    });
  }
}
