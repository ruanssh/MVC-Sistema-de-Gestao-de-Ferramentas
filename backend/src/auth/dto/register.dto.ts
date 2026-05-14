import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Perfil } from '@prisma/client';

export class RegisterDto {
  @IsString()
  nome: string;

  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  senha: string;

  @IsEnum(Perfil)
  perfil: Perfil;
}
