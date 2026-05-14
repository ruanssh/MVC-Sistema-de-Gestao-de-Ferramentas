import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SolicitacoesService } from './solicitacoes.service';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('solicitacoes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SolicitacoesController {
  constructor(private service: SolicitacoesService) {}

  @Get()
  findAll(@Query('status') status?: string, @Query('solicitanteId') solicitanteId?: string) {
    return this.service.findAll({ status, solicitanteId });
  }

  @Get('minhas')
  minhas(@CurrentUser() user: any) {
    return this.service.findAll({ solicitanteId: user.id });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('tecnico', 'almoxarife', 'coordenador')
  create(@Body() dto: CreateSolicitacaoDto, @CurrentUser() user: any) {
    return this.service.create(dto, user.id);
  }

  @Patch(':id/aprovar')
  @Roles('almoxarife', 'coordenador')
  aprovar(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.aprovar(id, user.id);
  }

  @Patch(':id/rejeitar')
  @Roles('almoxarife', 'coordenador')
  rejeitar(@Param('id') id: string, @Body('motivoRejeicao') motivo: string) {
    return this.service.rejeitar(id, motivo);
  }
}
