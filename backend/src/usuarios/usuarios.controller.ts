import { Controller, Get, Patch, Param, Query, Body, UseGuards, Post } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RegisterDto } from '../auth/dto/register.dto';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
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

  @Post()
  create(@Body() dto: RegisterDto) {
    return this.service.create(dto);
  }

  @Patch(':id/desativar')
  deactivate(@Param('id') id: string) {
    return this.service.deactivate(id);
  }

  @Patch(':id/reset-password')
  resetPassword(@Param('id') id: string, @Body() body: { novaSenha: string }) {
    return this.service.resetPassword(id, body.novaSenha);
  }

  @Patch(':id/perfil')
  updatePerfil(@Param('id') id: string, @Body() body: { perfil: string }) {
    return this.service.updatePerfil(id, body.perfil);
  }
}
