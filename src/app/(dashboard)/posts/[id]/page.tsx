import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PostEditor } from "@/components/posts/PostEditor";
import { ImageUpload } from "@/components/posts/ImageUpload";
import { Comentarios } from "@/components/posts/Comentarios";
import { HistoricoTimeline } from "@/components/posts/HistoricoTimeline";
import { BotaoExcluirPost } from "@/components/posts/BotaoExcluirPost";

async function getPost(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: {
      criadoPor: { select: { nome: true, papel: true } },
      imagens: { orderBy: { versao: "asc" } },
      comentarios: {
        orderBy: { criadoEm: "asc" },
        include: { autor: { select: { nome: true, papel: true } } },
      },
      historicos: {
        orderBy: { criadoEm: "desc" },
        include: { autor: { select: { nome: true } } },
      },
    },
  });
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect("/login");

  const post = await getPost(params.id);
  if (!post) notFound();

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-teal-500 transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/posts" className="hover:text-teal-500 transition-colors">
            Posts
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-xs">{post.titulo}</span>
        </div>

        {post.status !== "PUBLICADO" && (
          <BotaoExcluirPost postId={post.id} />
        )}
      </nav>

      {/* Editor */}
      <section className="card p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Informacoes do Post</h2>
        <PostEditor post={post} />
      </section>

      {/* Imagens */}
      <section className="card p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">
          Imagens
          {post.imagens.length > 0 && (
            <span className="ml-2 text-xs font-normal text-gray-400">
              {post.imagens.length} {post.imagens.length === 1 ? "arquivo" : "arquivos"}
            </span>
          )}
        </h2>
        <ImageUpload postId={post.id} imagens={post.imagens} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comentarios */}
        <section className="card p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">
            Comentarios
            {post.comentarios.length > 0 && (
              <span className="ml-2 text-xs font-normal text-gray-400">{post.comentarios.length}</span>
            )}
          </h2>
          <Comentarios postId={post.id} comentarios={post.comentarios} />
        </section>

        {/* Historico */}
        <section className="card p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">
            Historico de alteracoes
            {post.historicos.length > 0 && (
              <span className="ml-2 text-xs font-normal text-gray-400">{post.historicos.length}</span>
            )}
          </h2>
          <HistoricoTimeline historico={post.historicos} />
        </section>
      </div>
    </div>
  );
}
