"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Papel } from "@prisma/client";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function criarUsuarioAction(fd: FormData) {
  const session = await auth();
  if (!session || session.user.papel !== "TI") return { erro: "Sem permissao" };

  const nome  = (fd.get("nome") as string)?.trim();
  const email = (fd.get("email") as string)?.trim().toLowerCase();
  const senha = (fd.get("senha") as string);
  const papel = fd.get("papel") as Papel;

  if (!nome || !email || !senha || !papel) return { erro: "Todos os campos sao obrigatorios" };
  if (senha.length < 6) return { erro: "Senha deve ter ao menos 6 caracteres" };

  const existe = await prisma.user.findUnique({ where: { email } });
  if (existe) return { erro: "Email ja cadastrado" };

  await prisma.user.create({
    data: { nome, email, senhaHash: await bcrypt.hash(senha, 12), papel },
  });

  revalidatePath("/configuracoes");
  return { erro: null };
}

export async function alterarSenhaAction(fd: FormData) {
  const session = await auth();
  if (!session) return { erro: "Nao autenticado" };

  const userId    = fd.get("userId") as string;
  const novaSenha = (fd.get("novaSenha") as string);

  // Somente TI pode trocar senha de outros; qualquer um pode trocar a propria
  if (userId !== session.user.id && session.user.papel !== "TI") return { erro: "Sem permissao" };
  if (!novaSenha || novaSenha.length < 6) return { erro: "Senha deve ter ao menos 6 caracteres" };

  await prisma.user.update({
    where: { id: userId },
    data: { senhaHash: await bcrypt.hash(novaSenha, 12) },
  });

  revalidatePath("/configuracoes");
  return { erro: null };
}

export async function excluirUsuarioAction(userId: string) {
  const session = await auth();
  if (!session || session.user.papel !== "TI") return { erro: "Sem permissao" };
  if (userId === session.user.id) return { erro: "Voce nao pode excluir sua propria conta" };

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/configuracoes");
  return { erro: null };
}
