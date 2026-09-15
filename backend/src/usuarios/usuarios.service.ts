import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CriarUsuarioEquipeDto } from './dto/criar-usuario-equipe.dto';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  /** Lista a equipe (motoristas, guias, atendentes) — não inclui clientes aqui. */
  async listarEquipe() {
    return this.prisma.usuario.findMany({
      where: { tipo: { in: ['motorista', 'guia', 'atendente', 'admin'] } },
      select: { id: true, nome: true, email: true, telefone: true, tipo: true, ativo: true },
    });
  }

  async criarUsuarioEquipe(dto: CriarUsuarioEquipeDto) {
    const existente = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    if (existente) throw new ConflictException('Já existe um usuário com esse e-mail');

    const senhaHash = await bcrypt.hash(dto.senha, 10);
    return this.prisma.usuario.create({
      data: {
        nome: dto.nome,
        email: dto.email,
        senhaHash,
        telefone: dto.telefone,
        tipo: dto.tipo,
      },
      select: { id: true, nome: true, email: true, tipo: true },
    });
  }
}
