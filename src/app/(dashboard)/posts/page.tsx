import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostsGerencial } from "@/components/posts/PostsGerencial";

async function getTodosPosts() {
  return prisma.post.findMany({
    include: {
      criadoPor: { select: { nome: true, papel: true } },
      imagens: {
        select: { caminhoArquivo: true },
        orderBy: { versao: "asc" },
        take: 1,
      },
      comentarios: { select: { id: true } },
    },
    orderBy: [{ dataAgendada: "asc" }, { criadoEm: "desc" }],
  });
}

export default async function PostsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const posts = await getTodosPosts();

  return (
    <div className="p-6 lg:p-8 max-w-screen-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Posts</h1>
        <p className="text-sm text-gray-400 mt-0.5">{posts.length} posts no plano de conteudo</p>
      </div>
      <PostsGerencial posts={posts} />
    </div>
  );
}
