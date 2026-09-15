import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { ReservasService } from '../reservas/reservas.service';

/**
 * Integração com a API de Pagamentos do Mercado Pago (Pix, cartão, boleto).
 * Chamamos a REST API direto via fetch pra não depender de SDK instalado.
 * Docs: https://www.mercadopago.com.br/developers/pt/docs/checkout-api/payment-methods
 */
@Injectable()
export class PagamentosService {
  private readonly logger = new Logger(PagamentosService.name);
  private readonly accessToken: string;
  private readonly webhookSecret: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private reservasService: ReservasService,
  ) {
    this.accessToken = this.config.get<string>('MERCADOPAGO_ACCESS_TOKEN') ?? '';
    this.webhookSecret = this.config.get<string>('MERCADOPAGO_WEBHOOK_SECRET') ?? '';
  }

  private async criarPagamento(reservaId: string, corpo: Record<string, unknown>) {
    const reserva = await this.prisma.reserva.findUnique({
      where: { id: reservaId },
      include: { cliente: true },
    });
    if (!reserva) throw new NotFoundException('Reserva não encontrada');
    if (reserva.status === 'lista_espera') {
      throw new BadRequestException('Essa reserva está em lista de espera, sem vaga pra cobrar ainda');
    }

    const res = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
        'X-Idempotency-Key': `${reservaId}-${corpo.payment_method_id}`,
      },
      body: JSON.stringify({
        transaction_amount: Number(reserva.valorTotal),
        description: `Reserva AR Trip #${reserva.id.slice(0, 8)}`,
        payer: {
          email: reserva.cliente.email ?? 'cliente@artrip.com.br',
          first_name: reserva.cliente.nome.split(' ')[0],
        },
        external_reference: reserva.id,
        notification_url: this.config.get<string>('MERCADOPAGO_WEBHOOK_URL'),
        ...corpo,
      }),
    });

    if (!res.ok) {
      const erro = await res.text();
      this.logger.error(`Falha ao criar cobrança: ${erro}`);
      throw new BadRequestException('Não consegui gerar a cobrança agora. Tente novamente.');
    }

    return res.json();
  }

  /** Cria a cobrança Pix pra uma reserva pendente e retorna QR Code + copia-e-cola. */
  async criarCobrancaPix(reservaId: string) {
    const pagamento = await this.criarPagamento(reservaId, { payment_method_id: 'pix' });

    await this.prisma.pagamento.upsert({
      where: { reservaId },
      create: { reservaId, metodo: 'pix', valor: pagamento.transaction_amount, status: 'pendente', gatewayId: String(pagamento.id) },
      update: { gatewayId: String(pagamento.id), status: 'pendente', metodo: 'pix' },
    });

    const pix = pagamento.point_of_interaction?.transaction_data;
    return {
      pagamentoId: pagamento.id,
      qrCodeBase64: pix?.qr_code_base64 ?? null,
      copiaECola: pix?.qr_code ?? null,
      expiraEm: pagamento.date_of_expiration,
    };
  }

  /** Cria o boleto e retorna a URL do PDF pro cliente pagar em qualquer banco/lotérica. */
  async criarCobrancaBoleto(reservaId: string) {
    const pagamento = await this.criarPagamento(reservaId, { payment_method_id: 'bolbradesco' });

    await this.prisma.pagamento.upsert({
      where: { reservaId },
      create: { reservaId, metodo: 'boleto', valor: pagamento.transaction_amount, status: 'pendente', gatewayId: String(pagamento.id) },
      update: { gatewayId: String(pagamento.id), status: 'pendente', metodo: 'boleto' },
    });

    return {
      pagamentoId: pagamento.id,
      urlBoleto: pagamento.transaction_details?.external_resource_url ?? null,
      codigoBarras: pagamento.barcode?.content ?? null,
      vencimento: pagamento.date_of_expiration,
    };
  }

  /**
   * Cria a cobrança de cartão parcelado. `tokenCartao` vem do Mercado Pago
   * Bricks (componente de frontend que tokeniza o cartão sem os dados
   * passarem pelo nosso backend — requisito de segurança do próprio MP).
   */
  async criarCobrancaCartao(reservaId: string, tokenCartao: string, parcelas: number) {
    const pagamento = await this.criarPagamento(reservaId, {
      payment_method_id: 'master', // o Bricks já resolve a bandeira certa via token
      token: tokenCartao,
      installments: parcelas,
    });

    await this.prisma.pagamento.upsert({
      where: { reservaId },
      create: {
        reservaId,
        metodo: 'cartao',
        parcelas,
        valor: pagamento.transaction_amount,
        status: pagamento.status === 'approved' ? 'aprovado' : 'pendente',
        gatewayId: String(pagamento.id),
      },
      update: {
        metodo: 'cartao',
        parcelas,
        status: pagamento.status === 'approved' ? 'aprovado' : 'pendente',
        gatewayId: String(pagamento.id),
      },
    });

    if (pagamento.status === 'approved') {
      await this.reservasService.confirmarPagamento(reservaId);
    }

    return { pagamentoId: pagamento.id, status: pagamento.status };
  }

  /**
   * Confere a assinatura enviada pelo Mercado Pago (header x-signature) antes
   * de processar o webhook — sem isso, qualquer POST externo conseguiria
   * confirmar pagamentos falsos.
   * Docs: https://www.mercadopago.com.br/developers/pt/docs/checkout-api/webhooks#editor_2
   */
  validarAssinaturaWebhook(params: {
    xSignature: string | undefined;
    xRequestId: string | undefined;
    dataId: string | undefined;
  }): boolean {
    if (!this.webhookSecret) {
      this.logger.warn('MERCADOPAGO_WEBHOOK_SECRET não configurado — validação de assinatura pulada (não use assim em produção)');
      return true;
    }
    if (!params.xSignature || !params.xRequestId || !params.dataId) return false;

    const partes = Object.fromEntries(params.xSignature.split(',').map((p) => p.trim().split('=')));
    const manifest = `id:${params.dataId};request-id:${params.xRequestId};ts:${partes.ts};`;
    const hashCalculado = createHmac('sha256', this.webhookSecret).update(manifest).digest('hex');

    return hashCalculado === partes.v1;
  }

  /**
   * Processa o webhook do Mercado Pago. Ele manda só o ID — a gente sempre
   * busca o status oficial na API antes de confirmar (nunca confia só no
   * payload recebido).
   */
  async processarWebhook(pagamentoId: string) {
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${pagamentoId}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (!res.ok) {
      this.logger.warn(`Não consegui confirmar o pagamento ${pagamentoId} junto ao Mercado Pago`);
      return { ok: false };
    }

    const pagamento = await res.json();
    const reservaId = pagamento.external_reference;

    if (pagamento.status === 'approved') {
      await this.prisma.pagamento.updateMany({
        where: { gatewayId: String(pagamentoId) },
        data: { status: 'aprovado', pagoEm: new Date() },
      });
      await this.reservasService.confirmarPagamento(reservaId);
      this.logger.log(`Reserva ${reservaId} confirmada via ${pagamento.payment_method_id}`);
    } else if (pagamento.status === 'rejected') {
      await this.prisma.pagamento.updateMany({
        where: { gatewayId: String(pagamentoId) },
        data: { status: 'recusado' },
      });
    }

    return { ok: true, status: pagamento.status };
  }

  async statusPagamento(reservaId: string) {
    const pagamento = await this.prisma.pagamento.findUnique({ where: { reservaId } });
    if (!pagamento) throw new NotFoundException('Nenhum pagamento gerado pra essa reserva ainda');
    return pagamento;
  }
}
