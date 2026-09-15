import { IsBoolean, IsString } from 'class-validator';

export class MarcarItemDto {
  @IsString()
  itemId: string;

  @IsBoolean()
  concluido: boolean;
}
