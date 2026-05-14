import { Module } from '@nestjs/common';
import { SolicitacoesService } from './solicitacoes.service';
import { SolicitacoesController } from './solicitacoes.controller';

@Module({
  providers: [SolicitacoesService],
  controllers: [SolicitacoesController],
})
export class SolicitacoesModule {}
