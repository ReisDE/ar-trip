import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { PacotesModule } from './pacotes/pacotes.module';
import { ViagensModule } from './viagens/viagens.module';
import { ReservasModule } from './reservas/reservas.module';
import { LocalizacaoModule } from './localizacao/localizacao.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { AuthModule } from './auth/auth.module';
import { PagamentosModule } from './pagamentos/pagamentos.module';
import { OnibusModule } from './onibus/onibus.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ChecklistModule } from './checklist/checklist.module';
import { AvaliacoesModule } from './avaliacoes/avaliacoes.module';
import { GruposModule } from './grupos/grupos.module';
import { DocumentosModule } from './documentos/documentos.module';
import { ChatModule } from './chat/chat.module';
import { ConteudoModule } from './conteudo/conteudo.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TarefasModule } from './tarefas/tarefas.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    PacotesModule,
    ViagensModule,
    ReservasModule,
    LocalizacaoModule,
    WhatsappModule,
    PagamentosModule,
    OnibusModule,
    UsuariosModule,
    ChecklistModule,
    AvaliacoesModule,
    GruposModule,
    DocumentosModule,
    ChatModule,
    ConteudoModule,
    DashboardModule,
    TarefasModule,
    UploadsModule,
  ],
})
export class AppModule {}
