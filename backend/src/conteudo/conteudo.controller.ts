import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ConteudoService } from './conteudo.service';
import { AprovarConteudoDto } from './dto/aprovar-conteudo.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('conteudo')
export class ConteudoController {
  constructor(private readonly conteudoService: ConteudoService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Get('pendentes')
  listarPendentes() {
    return this.conteudoService.listarPendentes();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/aprovar')
  aprovar(@Param('id') id: string, @Body() dto: AprovarConteudoDto) {
    return this.conteudoService.aprovar(id, dto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/rejeitar')
  rejeitar(@Param('id') id: string) {
    return this.conteudoService.rejeitar(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Post(':id/publicar')
  publicar(@Param('id') id: string) {
    return this.conteudoService.publicar(id);
  }

  @Get('viagem/:viagemId/galeria')
  galeriaDaViagem(@Param('viagemId') viagemId: string) {
    return this.conteudoService.galeriaDaViagem(viagemId);
  }
}
