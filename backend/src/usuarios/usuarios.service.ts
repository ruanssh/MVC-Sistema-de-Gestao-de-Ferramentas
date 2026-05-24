import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  private mapUsuario(u: any) {
    return {
      id: u.id,
      nome: u.nome,
      username: u.username,
      email: u.email,
      perfil: u.perfil.slug,
      perfilDetalhe: u.perfil,
      createdAt: u.createdAt,
    };
  }

  async findAll() {
    const users = await this.prisma.usuario.findMany({
      where: { ativo: true },
      include: { perfil: { select: { id: true, nome: true, slug: true } } },
      orderBy: { nome: 'asc' },
    });
    return users.map((u) => this.mapUsuario(u));
  }

  async findOne(id: string) {
    const u = await this.prisma.usuario.findUnique({
      where: { id },
      include: { perfil: { select: { id: true, nome: true, slug: true } } },
    });
    if (!u) throw new NotFoundException('Usuário não encontrado');
    return this.mapUsuario(u);
  }

  async findByPerfil(perfil: string) {
    const users = await this.prisma.usuario.findMany({
      where: { perfil: { slug: perfil }, ativo: true },
      include: { perfil: { select: { id: true, nome: true, slug: true } } },
      orderBy: { nome: 'asc' },
    });
    return users.map((u) => this.mapUsuario(u));
  }

  async updatePerfil(id: string, perfilSlug: string) {
    await this.findOne(id);
    const perfil = await this.prisma.perfil.findUnique({ where: { slug: perfilSlug } });
    if (!perfil || !perfil.ativo) throw new NotFoundException('Perfil não encontrado ou inativo');

    const updated = await this.prisma.usuario.update({
      where: { id },
      data: { perfilId: perfil.id },
      include: { perfil: { select: { id: true, nome: true, slug: true } } },
    });
    return this.mapUsuario(updated);
  }

  async deactivate(id: string) {
    await this.findOne(id);
    return this.prisma.usuario.update({
      where: { id },
      data: { ativo: false },
      select: { id: true, nome: true, ativo: true },
    });
  }

  async resetPassword(id: string, novaSenha: string) {
    await this.findOne(id);
    const hash = await bcrypt.hash(novaSenha, 10);
    await this.prisma.usuario.update({ where: { id }, data: { senha: hash } });
    return { message: 'Senha redefinida com sucesso' };
  }
}
