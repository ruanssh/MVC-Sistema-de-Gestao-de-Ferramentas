import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RelatoriosService {
  constructor(private prisma: PrismaService) {}

  async porFerramenta(ferramentaId?: string) {
    const where: any = {};
    if (ferramentaId) where.ferramentaId = ferramentaId;
    return this.prisma.emprestimo.findMany({
      where,
      include: {
        ferramenta: { select: { codigo: true, nome: true, categoria: true } },
        responsavel: { select: { nome: true } },
      },
      orderBy: { dataRetirada: 'desc' },
    });
  }

  async porColaborador(responsavelId?: string) {
    const where: any = {};
    if (responsavelId) where.responsavelId = responsavelId;
    return this.prisma.emprestimo.findMany({
      where,
      include: {
        ferramenta: { select: { codigo: true, nome: true } },
        responsavel: { select: { nome: true, username: true } },
      },
      orderBy: { dataRetirada: 'desc' },
    });
  }

  async atrasos() {
    await this.prisma.emprestimo.updateMany({
      where: { status: 'ativo', dataDevolucaoPrevista: { lt: new Date() } },
      data: { status: 'atrasado' },
    });
    return this.prisma.emprestimo.findMany({
      where: { status: 'atrasado' },
      include: {
        ferramenta: { select: { codigo: true, nome: true } },
        responsavel: { select: { nome: true } },
      },
      orderBy: { dataDevolucaoPrevista: 'asc' },
    });
  }

  async porPeriodo(inicio: string, fim: string) {
    return this.prisma.emprestimo.findMany({
      where: {
        dataRetirada: { gte: new Date(inicio), lte: new Date(fim) },
      },
      include: {
        ferramenta: { select: { codigo: true, nome: true, categoria: true } },
        responsavel: { select: { nome: true } },
      },
      orderBy: { dataRetirada: 'desc' },
    });
  }

  async dashboard() {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    const [ferramentasStats, emprestimosStats, atrasados, novosMes] = await Promise.all([
      this.prisma.ferramenta.groupBy({ by: ['estado'], _count: { estado: true } }),
      this.prisma.emprestimo.groupBy({ by: ['status'], _count: { status: true } }),
      this.prisma.emprestimo.count({ where: { status: 'atrasado' } }),
      this.prisma.emprestimo.count({ where: { dataRetirada: { gte: inicioMes } } }),
    ]);

    return { ferramentasStats, emprestimosStats, atrasados, novosMes };
  }
}
