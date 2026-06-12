import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOADS_DIR = process.env.UPLOADS_DIR ?? path.join(process.cwd(), "uploads");
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  console.log("[upload] UPLOADS_DIR:", UPLOADS_DIR);
  console.log("[upload] cwd:", process.cwd());

  const session = await auth();
  if (!session) return NextResponse.json({ erro: "Nao autenticado" }, { status: 401 });

  const fd = await req.formData();
  const arquivo = fd.get("arquivo") as File | null;
  const postId = fd.get("postId") as string | null;

  console.log("[upload] arquivo:", arquivo?.name, arquivo?.size, arquivo?.type);
  console.log("[upload] postId:", postId);

  if (!arquivo || !postId) {
    return NextResponse.json({ erro: "Arquivo e postId obrigatorios" }, { status: 400 });
  }

  if (!TIPOS_PERMITIDOS.includes(arquivo.type)) {
    return NextResponse.json({ erro: "Tipo de arquivo nao permitido" }, { status: 400 });
  }

  if (arquivo.size > MAX_SIZE) {
    return NextResponse.json({ erro: "Arquivo muito grande (max 10 MB)" }, { status: 400 });
  }

  const versaoAtual = await prisma.imagem.count({ where: { postId } });

  const ext = arquivo.name.split(".").pop() ?? "jpg";
  const nomeArquivo = `${postId}_v${versaoAtual + 1}_${Date.now()}.${ext}`;
  const pastaPost = path.join(UPLOADS_DIR, postId);

  console.log("[upload] salvando em:", pastaPost, "/", nomeArquivo);

  try {
    await mkdir(pastaPost, { recursive: true });
    const caminho = path.join(pastaPost, nomeArquivo);
    const buffer = Buffer.from(await arquivo.arrayBuffer());
    await writeFile(caminho, buffer);
    console.log("[upload] arquivo salvo com sucesso:", caminho);
  } catch (err) {
    console.error("[upload] ERRO ao salvar arquivo:", err);
    return NextResponse.json({ erro: "Erro ao salvar arquivo no servidor" }, { status: 500 });
  }

  const caminhoRelativo = `/api/uploads/${postId}/${nomeArquivo}`;

  const imagem = await prisma.imagem.create({
    data: {
      postId,
      caminhoArquivo: caminhoRelativo,
      versao: versaoAtual + 1,
      enviadoPorId: session.user.id,
    },
  });

  console.log("[upload] imagem registrada no banco:", imagem.id);
  return NextResponse.json({ id: imagem.id, caminho: caminhoRelativo });
}
