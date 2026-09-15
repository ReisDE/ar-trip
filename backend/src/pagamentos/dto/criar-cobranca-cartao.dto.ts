import { IsInt, IsString, IsUUID, Max, Min } from 'class-validator';

export class CriarCobrancaCartaoDto {
  @IsUUID()
  reservaId: string;

  @IsString()
  tokenCartao: string;

  @IsInt()
  @Min(1)
  @Max(24)
  parcelas: number;
}
