import { prisma } from "@/lib/prisma";
import { StatusPost } from "@prisma/client";

export async function getPostsDoMes(ano: number, mes: number) {
  const inicio = new Date(ano, mes - 1, 1);
  const fim = new Date(ano, mes, 0, 23, 59, 59);

  return prisma.post.findMany({
    where: {
      dataAgendada: { gte: inicio, lte: fim },
    },
    include: { criadoPor: { select: { nome: true, papel: true } } },
    orderBy: { dataAgendada: "asc" },
  });
}

export async function getPostsSemData() {
  return prisma.post.findMany({
    where: { dataAgendada: null },
    include: { criadoPor: { select: { nome: true, papel: true } } },
    orderBy: { criadoEm: "desc" },
  });
}

export async function getResumoStatus() {
  const counts = await prisma.post.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const map: Record<string, number> = {};
  for (const c of counts) map[c.status] = c._count._all;
  return map;
}

export async function criarPost(data: {
  titulo: string;
  pilar: string;
  baseNormativa?: string;
  textoArte?: string;
  legenda?: string;
  hashtags?: string;
  promptImagem?: string;
  dataAgendada?: string;
  criadoPorId: string;
}) {
  const post = await prisma.post.create({
    data: {
      titulo: data.titulo,
      pilar: data.pilar,
      baseNormativa: data.baseNormativa ?? null,
      textoArte: data.textoArte ?? null,
      legenda: data.legenda ?? null,
      hashtags: data.hashtags ?? null,
      promptImagem: data.promptImagem ?? null,
      dataAgendada: data.dataAgendada ? new Date(data.dataAgendada) : null,
      status: StatusPost.RASCUNHO,
      criadoPorId: data.criadoPorId,
    },
  });

  await prisma.historico.create({
    data: {
      postId: post.id,
      autorId: data.criadoPorId,
      campo: "status",
      valorAntigo: null,
      valorNovo: StatusPost.RASCUNHO,
    },
  });

  return post;
}
