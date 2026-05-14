import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto';

const include = {
  ferramenta: { select: { id: true, codigo: true, nome: true, categoria: true, estado: true } },
  solicitante: { select: { id: true, nome: true, username: true } },
};

@Injectable()
export class SolicitacoesService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { status?: string; solicitanteId?: string }) {
    const where: any = {};
    if (params.status && params.status !== 'todas') where.status = params.status;
    if (params.solicitanteId) where.solicitanteId = params.solicitanteId;
    return this.prisma.solicitacao.findMany({
      where,
      include,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const s = await this.prisma.solicitacao.findUnique({ where: { id }, include });
    if (!s) throw new NotFoundException('Solicitação não encontrada');
    return s;
  }

  async create(dto: CreateSolicitacaoDto, solicitanteId: string) {
    const ferramenta = await this.prisma.ferramenta.findUnique({ where: { id: dto.ferramentaId } });
    if (!ferramenta) throw new NotFoundException('Ferramenta não encontrada');

    const pendente = await this.prisma.solicitacao.findFirst({
      where: { ferramentaId: dto.ferramentaId, solicitanteId, status: 'pendente' },
    });
    if (pendente) throw new BadRequestException('Já existe uma solicitação pendente para esta ferramenta');

    return this.prisma.solicitacao.create({
      data: {
        ferramentaId: dto.ferramentaId,
        solicitanteId,
        previsaoDevolucao: new Date(dto.previsaoDevolucao),
        observacoes: dto.observacoes,
      },
      include,
    });
  }

  async aprovar(id: string, almoxarifeId: string) {
    const s = await this.findOne(id);
    if (s.status !== 'pendente') throw new BadRequestException('Solicitação não está pendente');

    const ferramenta = await this.prisma.ferramenta.findUnique({ where: { id: s.ferramentaId } });
    if (ferramenta.estado !== 'disponivel') {
      throw new BadRequestException('Ferramenta não está disponível para empréstimo');
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.solicitacao.update({ where: { id }, data: { status: 'aprovada' }, include }),
      this.prisma.emprestimo.create({
        data: {
          ferramentaId: s.ferramentaId,
          responsavelId: s.solicitanteId,
          registradoPorId: almoxarifeId,
          dataDevolucaoPrevista: s.previsaoDevolucao,
          observacoes: s.observacoes,
        },
      }),
      this.prisma.ferramenta.update({ where: { id: s.ferramentaId }, data: { estado: 'emprestada' } }),
    ]);

    return updated;
  }

  async rejeitar(id: string, motivoRejeicao: string) {
    const s = await this.findOne(id);
    if (s.status !== 'pendente') throw new BadRequestException('Solicitação não está pendente');
    return this.prisma.solicitacao.update({
      where: { id },
      data: { status: 'rejeitada', motivoRejeicao },
      include,
    });
  }
}
