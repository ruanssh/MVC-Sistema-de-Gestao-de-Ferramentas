import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateSolicitacaoDto {
  @IsString()
  ferramentaId: string;

  @IsDateString()
  previsaoDevolucao: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
