import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CriarOnibusDto {
  @IsString()
  placa: string;

  @IsOptional()
  @IsString()
  modelo?: string;

  @IsInt()
  @Min(1)
  capacidade: number;

  /** Ex: [{ "fileira": 1, "poltronas": ["1A","1B","1C","1D"] }] — usado só pra gerar as poltronas abaixo */
  @IsOptional()
  layoutPoltronas?: unknown;
}
