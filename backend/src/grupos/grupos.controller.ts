import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GruposService } from './grupos.service';
import { CriarGrupoDto } from './dto/criar-grupo.dto';
import { EntrarGrupoDto } from './dto/entrar-grupo.dto';

@Controller('grupos')
export class GruposController {
  constructor(private readonly gruposService: GruposService) {}

  @Post()
  criar(@Body() dto: CriarGrupoDto) {
    return this.gruposService.criar(dto);
  }

  @Get(':linkToken')
  buscar(@Param('linkToken') linkToken: string) {
    return this.gruposService.buscarPorToken(linkToken);
  }

  @Post(':linkToken/entrar')
  entrar(@Param('linkToken') linkToken: string, @Body() dto: EntrarGrupoDto) {
    return this.gruposService.entrar(linkToken, dto);
  }
}
