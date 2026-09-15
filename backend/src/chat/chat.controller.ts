import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { EnviarMensagemDto } from './dto/enviar-mensagem.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  enviar(@Body() dto: EnviarMensagemDto) {
    return this.chatService.enviar(dto);
  }

  @Get('viagem/:viagemId/cliente/:clienteId')
  listarConversa(@Param('viagemId') viagemId: string, @Param('clienteId') clienteId: string) {
    return this.chatService.listarConversa(viagemId, clienteId);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'atendente')
  @Get('conversas')
  listarConversasAbertas() {
    return this.chatService.listarConversasAbertas();
  }
}
