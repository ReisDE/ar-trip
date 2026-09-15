import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';

export class CriarUsuarioEquipeDto {
  @IsString()
  nome: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  senha: string;

  @IsString()
  telefone: string;

  @IsIn(['motorista', 'guia', 'atendente', 'admin'])
  tipo: 'motorista' | 'guia' | 'atendente' | 'admin';
}
