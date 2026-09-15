import { Body, Controller, Get, Headers, Param, Post, UnauthorizedException } from '@nestjs/common';
import { PagamentosService } from './pagamentos.service';
import { CriarCobrancaDto } from './dto/criar-cobranca.dto';
import { CriarCobrancaCartaoDto } from './dto/criar-cobranca-cartao.dto';

@Controller('pagamentos')
export class PagamentosController {
  constructor(private readonly pagamentosService: PagamentosService) {}

  @Post('pix')
  criarPix(@Body() dto: CriarCobrancaDto) {
    return this.pagamentosService.criarCobrancaPix(dto.reservaId);
  }

  @Post('boleto')
  criarBoleto(@Body() dto: CriarCobrancaDto) {
    return this.pagamentosService.criarCobrancaBoleto(dto.reservaId);
  }

  @Post('cartao')
  criarCartao(@Body() dto: CriarCobrancaCartaoDto) {
    return this.pagamentosService.criarCobrancaCartao(dto.reservaId, dto.tokenCartao, dto.parcelas);
  }

  @Get(':reservaId/status')
  status(@Param('reservaId') reservaId: string) {
    return this.pagamentosService.statusPagamento(reservaId);
  }

  /** Endpoint público que o Mercado Pago chama sozinho quando o status muda. */
  @Post('webhook')
  webhook(
    @Body() body: { data?: { id?: string }; type?: string },
    @Headers('x-signature') xSignature?: string,
    @Headers('x-request-id') xRequestId?: string,
  ) {
    const assinaturaOk = this.pagamentosService.validarAssinaturaWebhook({
      xSignature,
      xRequestId,
      dataId: body.data?.id,
    });
    if (!assinaturaOk) throw new UnauthorizedException('Assinatura do webhook inválida');

    if (body.type === 'payment' && body.data?.id) {
      return this.pagamentosService.processarWebhook(body.data.id);
    }
    return { ok: true, ignorado: true };
  }
}
