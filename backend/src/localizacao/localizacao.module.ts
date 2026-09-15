import { Module } from '@nestjs/common';
import { LocalizacaoController } from './localizacao.controller';
import { LocalizacaoService } from './localizacao.service';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [WhatsappModule],
  controllers: [LocalizacaoController],
  providers: [LocalizacaoService],
})
export class LocalizacaoModule {}
