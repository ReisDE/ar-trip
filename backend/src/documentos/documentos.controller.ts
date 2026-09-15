import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { DocumentosService } from './documentos.service';
import { CriarDocumentoDto } from './dto/criar-documento.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'atendente')
  @Post()
  criar(@Body() dto: CriarDocumentoDto) {
    return this.documentosService.criar(dto);
  }

  @Get('viagem/:viagemId')
  listarPorViagem(@Param('viagemId') viagemId: string) {
    return this.documentosService.listarPorViagem(viagemId);
  }
}
