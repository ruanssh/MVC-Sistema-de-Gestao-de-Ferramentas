import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = (pwd: string) => bcrypt.hashSync(pwd, 10);

  await prisma.perfil.createMany({
    skipDuplicates: true,
    data: [
      { nome: 'Coordenador', slug: 'coordenador', descricao: 'Acesso total ao sistema' },
      { nome: 'Almoxarife', slug: 'almoxarife', descricao: 'Operacao de estoque e emprestimos' },
      { nome: 'Tecnico', slug: 'tecnico', descricao: 'Consulta e solicitacoes de ferramentas' },
    ],
  });

  const perfis = await prisma.perfil.findMany({
    where: { slug: { in: ['coordenador', 'almoxarife', 'tecnico'] } },
  });
  const perfilBySlug = Object.fromEntries(perfis.map((perfil) => [perfil.slug, perfil.id]));

  await prisma.usuario.createMany({
    skipDuplicates: true,
    data: [
      { nome: 'Coordenador de Manutencao', username: 'coordenador', email: 'coordenador@microservice.com', senha: hash('coord123'), perfilId: perfilBySlug['coordenador'] },
      { nome: 'Almoxarife do Sistema', username: 'almoxarife', email: 'almoxarife@microservice.com', senha: hash('almox123'), perfilId: perfilBySlug['almoxarife'] },
      { nome: 'Tecnico Colaborador', username: 'tecnico', email: 'tecnico@microservice.com', senha: hash('tecnico123'), perfilId: perfilBySlug['tecnico'] },
    ],
  });

  await prisma.ferramenta.createMany({
    skipDuplicates: true,
    data: [
      { codigo: 'FER001', nome: 'Chave de Fenda Phillips 1/4"', categoria: 'Manual', marca: 'Stanley', estado: 'disponivel', estadoConservacao: 'excelente', quantidade: 5, localizacao: 'Prateleira A1' },
      { codigo: 'FER002', nome: 'Furadeira Elétrica Impact 500W', categoria: 'Elétrica', marca: 'Bosch', estado: 'emprestada', estadoConservacao: 'bom', quantidade: 2, localizacao: 'Armário B3' },
      { codigo: 'FER003', nome: 'Alicate Universal 8 Polegadas', categoria: 'Manual', marca: 'Gedore', estado: 'disponivel', estadoConservacao: 'excelente', quantidade: 8, localizacao: 'Prateleira A2' },
      { codigo: 'FER004', nome: 'Esmerilhadeira Angular 4.1/2"', categoria: 'Elétrica', marca: 'Makita', estado: 'manutencao', estadoConservacao: 'regular', quantidade: 1, localizacao: 'Oficina' },
      { codigo: 'FER005', nome: 'Jogo de Chaves Allen Milímetro', categoria: 'Manual', marca: 'Tramontina', estado: 'disponivel', estadoConservacao: 'bom', quantidade: 3, localizacao: 'Gaveta C1' },
      { codigo: 'FER006', nome: 'Parafusadeira Sem Fio 12V', categoria: 'Elétrica', marca: 'DeWalt', estado: 'emprestada', estadoConservacao: 'excelente', quantidade: 4, localizacao: 'Armário B2' },
      { codigo: 'FER007', nome: 'Torquímetro Digital 10-200 Nm', categoria: 'Medição', marca: 'Gedore', estado: 'disponivel', estadoConservacao: 'excelente', quantidade: 2, localizacao: 'Sala de Calibração' },
      { codigo: 'FER008', nome: 'Martelo de Borracha 500g', categoria: 'Manual', marca: 'Tramontina', estado: 'disponivel', estadoConservacao: 'bom', quantidade: 6, localizacao: 'Prateleira A3' },
      { codigo: 'FER009', nome: 'Serra Tico-Tico 450W', categoria: 'Elétrica', marca: 'Black & Decker', estado: 'danificada', estadoConservacao: 'ruim', quantidade: 1, localizacao: 'Oficina' },
      { codigo: 'FER010', nome: 'Paquímetro Digital 150mm', categoria: 'Medição', marca: 'Mitutoyo', estado: 'disponivel', estadoConservacao: 'excelente', quantidade: 3, localizacao: 'Sala de Calibração' },
    ],
  });

  console.log('Seed concluído com sucesso.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
