import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostsGerencial } from "@/components/posts/PostsGerencial";

async function getTodosPosts() {
  return prisma.post.findMany({
    include: {
      criadoPor: { select: { nome: true, papel: true } },
      imagens: { select: { id: true } },
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
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Gerencial de Posts</h1>
        <p className="text-sm text-gray-500 mt-1">
          Todos os posts do Instagram — {posts.length} no total
        </p>
      </div>
      <PostsGerencial posts={posts} />
    </div>
  );
}
