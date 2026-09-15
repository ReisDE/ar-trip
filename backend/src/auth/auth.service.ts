import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrarDto } from './dto/registrar.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  private assinarToken(usuarioId: string, tipo: string) {
    const segredo = this.config.get<string>('JWT_SECRET') ?? 'dev-secret-troque-em-producao';
    return jwt.sign({ sub: usuarioId, tipo }, segredo, { expiresIn: '30d' });
  }

  /**
   * Cadastro do cliente final (site). Cria o Usuario (tipo cliente) e o
   * registro em Cliente já com código de indicação próprio.
   */
  async registrar(dto: RegistrarDto) {
    const existente = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    if (existente) throw new ConflictException('Já existe uma conta com esse e-mail');

    const senhaHash = await bcrypt.hash(dto.senha, 10);
    const codigoIndicacao = randomBytes(4).toString('hex');

    let indicadoPorId: string | undefined;
    if (dto.codigoIndicacao) {
      const indicador = await this.prisma.cliente.findUnique({ where: { codigoIndicacao: dto.codigoIndicacao } });
      indicadoPorId = indicador?.id;
    }

    const usuario = await this.prisma.usuario.create({
      data: {
        nome: dto.nome,
        email: dto.email,
        senhaHash,
        telefone: dto.telefone,
        tipo: 'cliente',
        cliente: {
          create: {
            nome: dto.nome,
            telefone: dto.telefone,
            email: dto.email,
            codigoIndicacao,
            indicadoPorId,
          },
        },
      },
      include: { cliente: true },
    });

    const token = this.assinarToken(usuario.id, usuario.tipo);
    return { token, cliente: usuario.cliente, tipo: usuario.tipo };
  }

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
      include: { cliente: true },
    });
    if (!usuario) throw new UnauthorizedException('E-mail ou senha inválidos');

    const senhaOk = await bcrypt.compare(dto.senha, usuario.senhaHash);
    if (!senhaOk) throw new UnauthorizedException('E-mail ou senha inválidos');

    const token = this.assinarToken(usuario.id, usuario.tipo);
    return { token, cliente: usuario.cliente, tipo: usuario.tipo };
  }

  verificarToken(token: string) {
    const segredo = this.config.get<string>('JWT_SECRET') ?? 'dev-secret-troque-em-producao';
    try {
      return jwt.verify(token, segredo) as { sub: string; tipo: string };
    } catch {
      throw new UnauthorizedException('Sessão inválida ou expirada');
    }
  }
}
