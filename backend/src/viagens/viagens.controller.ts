import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ViagensService } from './viagens.service';
import { CriarViagemDto } from './dto/criar-viagem.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('viagens')
export class ViagensController {
  constructor(private readonly viagensService: ViagensService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'atendente')
  @Get('do-dia')
  listarDoDia(@Query('data') data?: string) {
    return this.viagensService.listarDoDia(data ? new Date(data) : new Date());
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.viagensService.buscarPorId(id);
  }

  @Get(':id/vagas-disponiveis')
  vagasDisponiveis(@Param('id') id: string) {
    return this.viagensService.vagasDisponiveis(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  criar(@Body() dto: CriarViagemDto) {
    return this.viagensService.criar(dto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'motorista', 'guia')
  @Patch(':id/iniciar')
  iniciar(@Param('id') id: string) {
    return this.viagensService.iniciarViagem(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'motorista', 'guia')
  @Patch(':id/encerrar')
  encerrar(@Param('id') id: string) {
    return this.viagensService.encerrarViagem(id);
  }
}
