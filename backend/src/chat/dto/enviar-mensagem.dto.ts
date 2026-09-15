import { IsIn, IsString, IsUUID } from 'class-validator';

export class EnviarMensagemDto {
  @IsUUID()
  viagemId: string;

  @IsUUID()
  clienteId: string;

  @IsIn(['cliente', 'agencia'])
  remetente: 'cliente' | 'agencia';

  @IsString()
  texto: string;
}
