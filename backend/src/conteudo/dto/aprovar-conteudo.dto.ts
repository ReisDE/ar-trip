import { IsOptional, IsString } from 'class-validator';

export class AprovarConteudoDto {
  @IsOptional()
  @IsString()
  legendaFinal?: string;
}
