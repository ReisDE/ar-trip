import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CriarPacoteDto {
  @IsString()
  nome: string;

  @IsString()
  destino: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsNumber()
  @Min(0)
  precoBase: number;

  @IsInt()
  @Min(1)
  duracaoDias: number;

  @IsOptional()
  @IsString()
  inclui?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
