import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { OnibusService } from './onibus.service';
import { CriarOnibusDto } from './dto/criar-onibus.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('onibus')
export class OnibusController {
  constructor(private readonly onibusService: OnibusService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  listar() {
    return this.onibusService.listar();
  }

  @Get('viagens/:viagemId/mapa')
  mapaDeViagem(@Param('viagemId') viagemId: string) {
    return this.onibusService.mapaDeViagem(viagemId);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  criar(@Body() dto: CriarOnibusDto) {
    return this.onibusService.criar(dto);
  }
}
