"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusPost } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { STATUS_FLOW } from "@/types";

export async function atualizarPostAction(postId: string, fd: FormData) {
  const session = await auth();
  if (!session) return { erro: "Nao autenticado" };

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return { erro: "Post nao encontrado" };

  const campos = [
    "titulo", "pilar", "baseNormativa", "textoArte",
    "legenda", "hashtags", "promptImagem", "dataAgendada",
  ] as const;

  const alteracoes: { campo: string; valorAntigo: string | null; valorNovo: string | null }[] = [];

  const dadosNovos: Record<string, string | Date | null> = {};

  for (const campo of campos) {
    const valorNovo = (fd.get(campo) as string | null) ?? null;
    const valorAntigo = post[campo]
      ? campo === "dataAgendada"
        ? (post[campo] as Date).toISOString().split("T")[0]
        : String(post[campo])
      : null;

    const novoProcessado =
      campo === "dataAgendada"
        ? valorNovo || null
        : valorNovo?.trim() || null;

    if (valorAntigo !== novoProcessado) {
      alteracoes.push({ campo, valorAntigo, valorNovo: novoProcessado });
      dadosNovos[campo] =
        campo === "dataAgendada" && novoProcessado
          ? new Date(novoProcessado)
          : novoProcessado;
    }
  }

  if (alteracoes.length === 0) return { erro: null };

  await prisma.post.update({
    where: { id: postId },
    data: dadosNovos,
  });

  await prisma.historico.createMany({
    data: alteracoes.map((a) => ({
      postId,
      autorId: session.user.id,
      campo: a.campo,
      valorAntigo: a.valorAntigo,
      valorNovo: a.valorNovo,
    })),
  });

  revalidatePath(`/posts/${postId}`);
  return { erro: null };
}

export async function avancarStatusAction(postId: string) {
  const session = await auth();
  if (!session) return { erro: "Nao autenticado" };

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return { erro: "Post nao encontrado" };

  const proximoStatus = STATUS_FLOW[post.status] as StatusPost | null;
  if (!proximoStatus) return { erro: "Status ja e o final" };

  await prisma.post.update({
    where: { id: postId },
    data: { status: proximoStatus },
  });

  await prisma.historico.create({
    data: {
      postId,
      autorId: session.user.id,
      campo: "status",
      valorAntigo: post.status,
      valorNovo: proximoStatus,
    },
  });

  revalidatePath(`/posts/${postId}`);
  revalidatePath("/dashboard");
  return { erro: null };
}

export async function voltarStatusAction(postId: string) {
  const session = await auth();
  if (!session) return { erro: "Nao autenticado" };

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return { erro: "Post nao encontrado" };

  const FLUXO_REVERSO: Record<string, StatusPost | null> = {
    REVISAO:   StatusPost.RASCUNHO,
    APROVADO:  StatusPost.REVISAO,
    PUBLICADO: StatusPost.APROVADO,
    RASCUNHO:  null,
  };

  const statusAnterior = FLUXO_REVERSO[post.status];
  if (!statusAnterior) return { erro: "Nao e possivel voltar deste status" };

  await prisma.post.update({ where: { id: postId }, data: { status: statusAnterior } });

  await prisma.historico.create({
    data: {
      postId,
      autorId: session.user.id,
      campo: "status",
      valorAntigo: post.status,
      valorNovo: statusAnterior,
    },
  });

  revalidatePath(`/posts/${postId}`);
  revalidatePath("/dashboard");
  return { erro: null };
}

export async function adicionarComentarioAction(postId: string, texto: string) {
  const session = await auth();
  if (!session) return { erro: "Nao autenticado" };
  if (!texto.trim()) return { erro: "Comentario vazio" };

  await prisma.comentario.create({
    data: { postId, autorId: session.user.id, texto: texto.trim() },
  });

  revalidatePath(`/posts/${postId}`);
  return { erro: null };
}

export async function excluirImagemAction(imagemId: string, postId: string) {
  const session = await auth();
  if (!session) return { erro: "Nao autenticado" };

  const imagem = await prisma.imagem.findUnique({ where: { id: imagemId } });
  if (!imagem) return { erro: "Imagem nao encontrada" };

  await prisma.imagem.delete({ where: { id: imagemId } });

  revalidatePath(`/posts/${postId}`);
  return { erro: null };
}
