import { Module } from '@nestjs/common';
import { OnibusController } from './onibus.controller';
import { OnibusService } from './onibus.service';

@Module({
  controllers: [OnibusController],
  providers: [OnibusService],
})
export class OnibusModule {}
