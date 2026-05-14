import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { EstadoConservacao, EstadoFerramenta } from '@prisma/client';

export class CreateFerramentaDto {
  @IsString()
  codigo: string;

  @IsString()
  nome: string;

  @IsString()
  categoria: string;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsEnum(EstadoFerramenta)
  estado?: EstadoFerramenta;

  @IsOptional()
  @IsEnum(EstadoConservacao)
  estadoConservacao?: EstadoConservacao;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantidade?: number;

  @IsOptional()
  @IsString()
  localizacao?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
