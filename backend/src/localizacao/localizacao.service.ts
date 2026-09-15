import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { RegistrarLocalizacaoDto } from './dto/registrar-localizacao.dto';

@Injectable()
export class LocalizacaoService {
  constructor(
    private prisma: PrismaService,
    private whatsappService: WhatsappService,
  ) {}

  private gerarToken() {
    return randomBytes(12).toString('hex');
  }

  /** Chamado quando o motorista toca em "Iniciar Viagem". Gera o link público único e avisa os passageiros. */
  async iniciarRastreio(viagemId: string) {
    const token = this.gerarToken();
    await this.prisma.viagem.update({ where: { id: viagemId }, data: { status: 'em_andamento' } });

    const url = `/rastreio/${token}`;
    await this.notificarPassageiros(viagemId, url);

    return { linkPublico: token, url };
  }

  /** Manda o link de rastreio pro WhatsApp de cada passageiro com reserva confirmada nessa viagem. */
  private async notificarPassageiros(viagemId: string, urlRelativa: string) {
    const reservas = await this.prisma.reserva.findMany({
      where: { viagemId, status: 'confirmada' },
      include: { cliente: true },
    });

    await Promise.all(
      reservas.map((reserva) =>
        this.whatsappService.enviarMensagem(
          reserva.cliente.telefone,
          `A viagem começou! Acompanhe ao vivo por aqui: ${urlRelativa} (funciona sem precisar instalar nada — pode mandar pra quem quiser acompanhar também).`,
        ),
      ),
    );
  }

  /** Recebe uma atualização de GPS do celular do motorista/Anderson. */
  async registrar(dto: RegistrarLocalizacaoDto, linkPublico: string) {
    return this.prisma.localizacao.create({
      data: {
        viagemId: dto.viagemId,
        lat: dto.lat,
        lng: dto.lng,
        linkPublico,
        expirado: false,
      },
    });
  }

  /** Usado pela tela pública de rastreio do passageiro. */
  async buscarPorLink(linkPublico: string) {
    const localizacao = await this.prisma.localizacao.findFirst({
      where: { linkPublico, expirado: false },
      orderBy: { registradoEm: 'desc' },
      include: { viagem: { include: { pacote: true } } },
    });
    if (!localizacao) throw new NotFoundException('Link de rastreio inválido ou expirado');
    return localizacao;
  }

  /** Expira todos os links de uma viagem quando ela é encerrada. */
  async expirarPorViagem(viagemId: string) {
    return this.prisma.localizacao.updateMany({
      where: { viagemId },
      data: { expirado: true },
    });
  }

  /** Usado pelo botão "compartilhar com amigos" — pega o link ativo sem precisar reiniciar o rastreio. */
  async buscarLinkAtivoPorViagem(viagemId: string) {
    const localizacao = await this.prisma.localizacao.findFirst({
      where: { viagemId, expirado: false },
      orderBy: { registradoEm: 'desc' },
    });
    if (!localizacao) throw new NotFoundException('Nenhum rastreio ativo para essa viagem');
    return { linkPublico: localizacao.linkPublico, url: `/rastreio/${localizacao.linkPublico}` };
  }

  async painelDoAnderson() {
    return this.prisma.viagem.findMany({
      where: { status: 'em_andamento' },
      include: {
        pacote: true,
        localizacoes: { orderBy: { registradoEm: 'desc' }, take: 1 },
      },
    });
  }
}
