import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { PacotesService } from './pacotes.service';
import { CriarPacoteDto } from './dto/criar-pacote.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('pacotes')
export class PacotesController {
  constructor(private readonly pacotesService: PacotesService) {}

  @Get()
  listar(@Query('destino') destino?: string, @Query('precoMax') precoMax?: string) {
    return this.pacotesService.listar({
      destino,
      precoMax: precoMax ? Number(precoMax) : undefined,
    });
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.pacotesService.buscarPorId(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  criar(@Body() dto: CriarPacoteDto) {
    return this.pacotesService.criar(dto);
  }
}
