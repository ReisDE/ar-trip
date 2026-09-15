import { IsString, IsUUID } from 'class-validator';

export class CriarGrupoDto {
  @IsUUID()
  viagemId: string;

  @IsString()
  nome: string;
}
