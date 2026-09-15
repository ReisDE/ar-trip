import { IsOptional, IsUUID } from 'class-validator';

export class CriarReservaDto {
  @IsUUID()
  viagemId: string;

  @IsUUID()
  clienteId: string;

  @IsOptional()
  @IsUUID()
  poltronaId?: string;
}
