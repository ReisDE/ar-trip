import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { ConteudoModule } from '../conteudo/conteudo.module';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [ConteudoModule, UploadsModule],
  controllers: [WhatsappController],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
