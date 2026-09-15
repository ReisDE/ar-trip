import { IsString, IsUUID } from 'class-validator';

export class CriarDocumentoDto {
  @IsUUID()
  viagemId: string;

  @IsString()
  nome: string;

  /** URL do arquivo já enviado pro storage (R2/S3) — o upload em si fica pra fase de infraestrutura. */
  @IsString()
  urlArquivo: string;
}
