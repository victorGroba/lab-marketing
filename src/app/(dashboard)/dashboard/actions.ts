"use server";

import { auth } from "@/lib/auth";
import { criarPost } from "@/lib/posts";

export async function criarPostAction(fd: FormData) {
  const session = await auth();
  if (!session) return { erro: "Nao autenticado", id: null };

  const titulo = fd.get("titulo") as string;
  const pilar = fd.get("pilar") as string;

  if (!titulo?.trim() || !pilar?.trim()) {
    return { erro: "Titulo e pilar sao obrigatorios", id: null };
  }

  const post = await criarPost({
    titulo: titulo.trim(),
    pilar: pilar.trim(),
    dataAgendada: (fd.get("dataAgendada") as string) || undefined,
    criadoPorId: session.user.id,
  });

  return { erro: null, id: post.id };
}
