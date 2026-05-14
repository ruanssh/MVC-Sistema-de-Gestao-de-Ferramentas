import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.usuario.findMany({
      where: { ativo: true },
      select: { id: true, nome: true, username: true, email: true, perfil: true, createdAt: true },
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: string) {
    const u = await this.prisma.usuario.findUnique({
      where: { id },
      select: { id: true, nome: true, username: true, email: true, perfil: true },
    });
    if (!u) throw new NotFoundException('Usuário não encontrado');
    return u;
  }

  async findByPerfil(perfil: string) {
    return this.prisma.usuario.findMany({
      where: { perfil: perfil as any, ativo: true },
      select: { id: true, nome: true, username: true, email: true, perfil: true },
      orderBy: { nome: 'asc' },
    });
  }

  async deactivate(id: string) {
    await this.findOne(id);
    return this.prisma.usuario.update({
      where: { id },
      data: { ativo: false },
      select: { id: true, nome: true, ativo: true },
    });
  }
}
