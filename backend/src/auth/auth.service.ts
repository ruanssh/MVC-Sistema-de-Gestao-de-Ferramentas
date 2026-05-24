import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  private toAuthUser(user: {
    id: string;
    nome: string;
    username: string;
    email: string;
    perfil: { id: string; nome: string; slug: string };
  }) {
    return {
      id: user.id,
      nome: user.nome,
      username: user.username,
      email: user.email,
      perfil: user.perfil.slug,
      perfilDetalhe: user.perfil,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.usuario.findUnique({
      where: { username: dto.username },
      include: { perfil: { select: { id: true, nome: true, slug: true } } },
    });
    if (!user || !user.ativo) throw new UnauthorizedException('Credenciais inválidas');

    const valid = await bcrypt.compare(dto.senha, user.senha);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');

    const token = this.jwt.sign({ sub: user.id, username: user.username });

    return {
      access_token: token,
      user: this.toAuthUser(user),
    };
  }

  async register(dto: RegisterDto) {
    const exists = await this.prisma.usuario.findFirst({
      where: { OR: [{ username: dto.username }, { email: dto.email }] },
    });
    if (exists) throw new ConflictException('Usuário ou e-mail já cadastrado');

    const perfil = await this.prisma.perfil.findUnique({ where: { slug: dto.perfil } });
    if (!perfil || !perfil.ativo) {
      throw new ConflictException('Perfil inválido ou inativo');
    }

    const hash = await bcrypt.hash(dto.senha, 10);
    const user = await this.prisma.usuario.create({
      data: {
        nome: dto.nome,
        username: dto.username,
        email: dto.email,
        senha: hash,
        perfilId: perfil.id,
      },
      include: { perfil: { select: { id: true, nome: true, slug: true } } },
    });

    const token = this.jwt.sign({ sub: user.id, username: user.username });
    return { access_token: token, user: this.toAuthUser(user) };
  }

  async me(userId: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      include: { perfil: { select: { id: true, nome: true, slug: true } } },
    });
    return user ? this.toAuthUser(user) : null;
  }

  async forgotPassword(email: string) {
    // Sempre retorna sucesso para não expor quais e-mails estão cadastrados
    await this.prisma.usuario.findUnique({ where: { email } });
    return { message: 'Se o e-mail estiver cadastrado, as instruções foram enviadas.' };
  }
}
