import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.usuario.findUnique({ where: { username: dto.username } });
    if (!user || !user.ativo) throw new UnauthorizedException('Credenciais inválidas');

    const valid = await bcrypt.compare(dto.senha, user.senha);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');

    const token = this.jwt.sign({ sub: user.id, username: user.username });

    return {
      access_token: token,
      user: { id: user.id, nome: user.nome, username: user.username, email: user.email, perfil: user.perfil },
    };
  }

  async register(dto: RegisterDto) {
    const exists = await this.prisma.usuario.findFirst({
      where: { OR: [{ username: dto.username }, { email: dto.email }] },
    });
    if (exists) throw new ConflictException('Usuário ou e-mail já cadastrado');

    const hash = await bcrypt.hash(dto.senha, 10);
    const user = await this.prisma.usuario.create({
      data: { nome: dto.nome, username: dto.username, email: dto.email, senha: hash, perfil: dto.perfil },
      select: { id: true, nome: true, username: true, email: true, perfil: true },
    });

    const token = this.jwt.sign({ sub: user.id, username: user.username });
    return { access_token: token, user };
  }

  async me(userId: string) {
    return this.prisma.usuario.findUnique({
      where: { id: userId },
      select: { id: true, nome: true, username: true, email: true, perfil: true },
    });
  }
}
