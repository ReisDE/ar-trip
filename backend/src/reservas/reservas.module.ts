import { Module } from '@nestjs/common';
import { ReservasController } from './reservas.controller';
import { ReservasService } from './reservas.service';
import { ViagensModule } from '../viagens/viagens.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [ViagensModule, WhatsappModule],
  controllers: [ReservasController],
  providers: [ReservasService],
  exports: [ReservasService],
})
export class ReservasModule {}
