import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFerramentaDto } from './dto/create-ferramenta.dto';
import { EstadoFerramenta } from '@prisma/client';

@Injectable()
export class FeramentasService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { search?: string; categoria?: string; estado?: string }) {
    const where: any = {};
    if (params.search) {
      where.OR = [
        { nome: { contains: params.search, mode: 'insensitive' } },
        { codigo: { contains: params.search, mode: 'insensitive' } },
        { marca: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params.categoria && params.categoria !== 'todas') {
      where.categoria = params.categoria;
    }
    if (params.estado && params.estado !== 'todos') {
      where.estado = params.estado;
    }
    return this.prisma.ferramenta.findMany({ where, orderBy: { nome: 'asc' } });
  }

  async findOne(id: string) {
    const f = await this.prisma.ferramenta.findUnique({ where: { id } });
    if (!f) throw new NotFoundException('Ferramenta não encontrada');
    return f;
  }

  async create(dto: CreateFerramentaDto) {
    const existing = await this.prisma.ferramenta.findUnique({ where: { codigo: dto.codigo } });
    if (existing) throw new BadRequestException('Código já cadastrado');
    return this.prisma.ferramenta.create({ data: dto });
  }

  async update(id: string, dto: Partial<CreateFerramentaDto>) {
    await this.findOne(id);
    return this.prisma.ferramenta.update({ where: { id }, data: dto });
  }

  async updateEstado(id: string, estado: EstadoFerramenta) {
    await this.findOne(id);
    return this.prisma.ferramenta.update({ where: { id }, data: { estado } });
  }

  async remove(id: string) {
    await this.findOne(id);
    const emprestimosAtivos = await this.prisma.emprestimo.count({
      where: { ferramentaId: id, status: 'ativo' },
    });
    if (emprestimosAtivos > 0) {
      throw new BadRequestException('Ferramenta possui empréstimos ativos');
    }
    return this.prisma.ferramenta.delete({ where: { id } });
  }

  async stats() {
    const [total, disponivel, emprestada, manutencao, danificada] = await Promise.all([
      this.prisma.ferramenta.count(),
      this.prisma.ferramenta.count({ where: { estado: 'disponivel' } }),
      this.prisma.ferramenta.count({ where: { estado: 'emprestada' } }),
      this.prisma.ferramenta.count({ where: { estado: 'manutencao' } }),
      this.prisma.ferramenta.count({ where: { estado: 'danificada' } }),
    ]);
    return { total, disponivel, emprestada, manutencao, danificada };
  }

  async categorias() {
    const result = await this.prisma.ferramenta.groupBy({
      by: ['categoria'],
      _count: { categoria: true },
      orderBy: { _count: { categoria: 'desc' } },
    });
    return result.map((r) => ({ categoria: r.categoria, total: r._count.categoria }));
  }
}
