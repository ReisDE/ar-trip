import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { CriarReservaDto } from './dto/criar-reserva.dto';

@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Post()
  criar(@Body() dto: CriarReservaDto) {
    return this.reservasService.criar(dto);
  }

  @Patch(':id/confirmar-pagamento')
  confirmarPagamento(@Param('id') id: string) {
    return this.reservasService.confirmarPagamento(id);
  }

  @Patch(':id/cancelar')
  cancelar(@Param('id') id: string) {
    return this.reservasService.cancelar(id);
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.reservasService.buscarPorId(id);
  }

  @Get('cliente/:clienteId')
  listarPorCliente(@Param('clienteId') clienteId: string) {
    return this.reservasService.listarPorCliente(clienteId);
  }
}
