import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateEmprestimoDto {
  @IsString()
  ferramentaId: string;

  @IsString()
  responsavelId: string;

  @IsOptional()
  @IsString()
  setor?: string;

  @IsDateString()
  dataDevolucaoPrevista: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
