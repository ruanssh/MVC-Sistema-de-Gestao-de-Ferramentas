import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmprestimoDto } from './dto/create-emprestimo.dto';

const include = {
  ferramenta: { select: { id: true, codigo: true, nome: true, categoria: true } },
  responsavel: { select: { id: true, nome: true, username: true } },
  registradoPor: { select: { id: true, nome: true } },
};

@Injectable()
export class EmprestimosService {
  constructor(private prisma: PrismaService) {}

  private async syncAtrasados() {
    await this.prisma.emprestimo.updateMany({
      where: {
        status: 'ativo',
        dataDevolucaoPrevista: { lt: new Date() },
      },
      data: { status: 'atrasado' },
    });
  }

  async findAll(params: { status?: string; responsavelId?: string }) {
    await this.syncAtrasados();
    const where: any = {};
    if (params.status && params.status !== 'todos') where.status = params.status;
    if (params.responsavelId) where.responsavelId = params.responsavelId;
    return this.prisma.emprestimo.findMany({
      where,
      include,
      orderBy: { dataRetirada: 'desc' },
    });
  }

  async findOne(id: string) {
    const e = await this.prisma.emprestimo.findUnique({ where: { id }, include });
    if (!e) throw new NotFoundException('Empréstimo não encontrado');
    return e;
  }

  async create(dto: CreateEmprestimoDto, registradoPorId: string) {
    const ferramenta = await this.prisma.ferramenta.findUnique({ where: { id: dto.ferramentaId } });
    if (!ferramenta) throw new NotFoundException('Ferramenta não encontrada');
    if (ferramenta.estado !== 'disponivel') {
      throw new BadRequestException(`Ferramenta não disponível (estado: ${ferramenta.estado})`);
    }

    const [emprestimo] = await this.prisma.$transaction([
      this.prisma.emprestimo.create({
        data: {
          ferramentaId: dto.ferramentaId,
          responsavelId: dto.responsavelId,
          registradoPorId,
          setor: dto.setor,
          dataDevolucaoPrevista: new Date(dto.dataDevolucaoPrevista),
          observacoes: dto.observacoes,
        },
        include,
      }),
      this.prisma.ferramenta.update({
        where: { id: dto.ferramentaId },
        data: { estado: 'emprestada' },
      }),
    ]);

    return emprestimo;
  }

  async devolver(id: string, observacoes?: string) {
    const emprestimo = await this.findOne(id);
    if (emprestimo.status === 'devolvido') {
      throw new BadRequestException('Empréstimo já foi devolvido');
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.emprestimo.update({
        where: { id },
        data: { status: 'devolvido', dataDevolucaoReal: new Date(), observacoes: observacoes || emprestimo.observacoes },
        include,
      }),
      this.prisma.ferramenta.update({
        where: { id: emprestimo.ferramentaId },
        data: { estado: 'disponivel' },
      }),
    ]);

    return updated;
  }

  async stats() {
    await this.syncAtrasados();
    const [total, ativos, atrasados, devolvidos] = await Promise.all([
      this.prisma.emprestimo.count(),
      this.prisma.emprestimo.count({ where: { status: 'ativo' } }),
      this.prisma.emprestimo.count({ where: { status: 'atrasado' } }),
      this.prisma.emprestimo.count({ where: { status: 'devolvido' } }),
    ]);
    return { total, ativos, atrasados, devolvidos };
  }

  async maisUtilizadas() {
    const result = await this.prisma.emprestimo.groupBy({
      by: ['ferramentaId'],
      _count: { ferramentaId: true },
      orderBy: { _count: { ferramentaId: 'desc' } },
      take: 5,
    });
    const ids = result.map((r) => r.ferramentaId);
    const ferramentas = await this.prisma.ferramenta.findMany({ where: { id: { in: ids } } });
    return result.map((r) => ({
      ferramenta: ferramentas.find((f) => f.id === r.ferramentaId),
      total: r._count.ferramentaId,
    }));
  }
}
