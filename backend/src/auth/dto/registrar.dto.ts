import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegistrarDto {
  @IsString()
  nome: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  senha: string;

  @IsString()
  telefone: string;

  @IsOptional()
  @IsString()
  codigoIndicacao?: string;
}
