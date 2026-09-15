import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CriarAvaliacaoDto {
  @IsUUID()
  viagemId: string;

  @IsUUID()
  clienteId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  nota: number;

  @IsOptional()
  @IsString()
  comentario?: string;
}
