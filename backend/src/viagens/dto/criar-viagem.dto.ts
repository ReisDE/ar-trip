import { IsDateString, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CriarViagemDto {
  @IsUUID()
  pacoteId: string;

  @IsDateString()
  dataSaida: string;

  @IsDateString()
  dataRetorno: string;

  @IsOptional()
  @IsUUID()
  onibusId?: string;

  @IsOptional()
  @IsUUID()
  motoristaId?: string;

  @IsOptional()
  @IsUUID()
  guiaId?: string;

  @IsString()
  localEmbarque: string;

  @IsInt()
  @Min(1)
  vagasTotais: number;
}
