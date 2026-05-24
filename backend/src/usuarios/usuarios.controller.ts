import { Controller, Get, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuariosController {
  constructor(private service: UsuariosService) {}

  @Get()
  findAll(@Query('perfil') perfil?: string) {
    if (perfil) return this.service.findByPerfil(perfil);
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/desativar')
  @Roles('coordenador')
  deactivate(@Param('id') id: string) {
    return this.service.deactivate(id);
  }

  @Patch(':id/reset-password')
  @Roles('coordenador')
  resetPassword(@Param('id') id: string, @Body() body: { novaSenha: string }) {
    return this.service.resetPassword(id, body.novaSenha);
  }
}
