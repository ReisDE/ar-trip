import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ChecklistService } from './checklist.service';
import { MarcarItemDto } from './dto/marcar-item.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'motorista', 'guia')
@Controller('viagens/:viagemId/checklist')
export class ChecklistController {
  constructor(private readonly checklistService: ChecklistService) {}

  @Get()
  buscar(@Param('viagemId') viagemId: string) {
    return this.checklistService.buscarOuCriar(viagemId);
  }

  @Patch('item')
  marcarItem(@Param('viagemId') viagemId: string, @Body() dto: MarcarItemDto) {
    return this.checklistService.marcarItem(viagemId, dto);
  }

  @Post('liberar')
  liberar(@Param('viagemId') viagemId: string) {
    return this.checklistService.liberarViagem(viagemId);
  }
}
