import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AvaliacoesService } from './avaliacoes.service';
import { CriarAvaliacaoDto } from './dto/criar-avaliacao.dto';

@Controller('avaliacoes')
export class AvaliacoesController {
  constructor(private readonly avaliacoesService: AvaliacoesService) {}

  @Post()
  criar(@Body() dto: CriarAvaliacaoDto) {
    return this.avaliacoesService.criar(dto);
  }

  @Get('viagem/:viagemId')
  listarPorViagem(@Param('viagemId') viagemId: string) {
    return this.avaliacoesService.listarPorViagem(viagemId);
  }

  @Get('media')
  mediaGeral() {
    return this.avaliacoesService.mediaGeral();
  }
}
