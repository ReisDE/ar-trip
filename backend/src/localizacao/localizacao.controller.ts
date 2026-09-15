import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { LocalizacaoService } from './localizacao.service';
import { RegistrarLocalizacaoDto } from './dto/registrar-localizacao.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('localizacao')
export class LocalizacaoController {
  constructor(private readonly localizacaoService: LocalizacaoService) {}

  @Post('viagens/:viagemId/iniciar')
  iniciar(@Param('viagemId') viagemId: string) {
    return this.localizacaoService.iniciarRastreio(viagemId);
  }

  @Post(':linkPublico')
  registrar(@Param('linkPublico') linkPublico: string, @Body() dto: RegistrarLocalizacaoDto) {
    return this.localizacaoService.registrar(dto, linkPublico);
  }

  @Get('viagens/:viagemId/link-ativo')
  linkAtivo(@Param('viagemId') viagemId: string) {
    return this.localizacaoService.buscarLinkAtivoPorViagem(viagemId);
  }

  @Get('rastreio/:linkPublico')
  buscarPorLink(@Param('linkPublico') linkPublico: string) {
    return this.localizacaoService.buscarPorLink(linkPublico);
  }

  @UseGuards(AuthGuard)
  @Get('painel')
  painel() {
    return this.localizacaoService.painelDoAnderson();
  }
}
