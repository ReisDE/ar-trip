import { IsUUID } from 'class-validator';

export class EntrarGrupoDto {
  @IsUUID()
  clienteId: string;
}
