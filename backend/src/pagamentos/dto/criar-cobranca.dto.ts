import { IsUUID } from 'class-validator';

export class CriarCobrancaDto {
  @IsUUID()
  reservaId: string;
}
