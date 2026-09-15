import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CriarUsuarioEquipeDto } from './dto/criar-usuario-equipe.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('equipe')
  listarEquipe() {
    return this.usuariosService.listarEquipe();
  }

  @Post('equipe')
  criarUsuarioEquipe(@Body() dto: CriarUsuarioEquipeDto) {
    return this.usuariosService.criarUsuarioEquipe(dto);
  }
}
