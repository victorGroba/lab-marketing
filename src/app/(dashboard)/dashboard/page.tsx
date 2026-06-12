import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { GaleriaDashboard } from "@/components/posts/GaleriaDashboard";

async function getPosts() {
  const posts = await prisma.post.findMany({
    include: {
      imagens: {
        select: { caminhoArquivo: true },
        orderBy: { versao: "asc" },
        take: 1,
      },
      _count: { select: { comentarios: true } },
    },
    orderBy: [{ dataAgendada: "asc" }, { criadoEm: "desc" }],
  });

  return posts.map((p) => ({
    id: p.id,
    titulo: p.titulo,
    pilar: p.pilar,
    status: p.status,
    dataAgendada: p.dataAgendada,
    legenda: p.legenda,
    hashtags: p.hashtags,
    imagem: p.imagens[0]?.caminhoArquivo ?? null,
    totalComentarios: p._count.comentarios,
  }));
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const posts = await getPosts();

  if (posts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-teal-400/10 border border-teal-400/20 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Nenhum post criado</h2>
        <p className="text-gray-400 mb-8 max-w-sm">
          Comece criando o primeiro post do laboratorio. Adicione o conteudo, suba a imagem e agende a publicacao.
        </p>
        <Link href="/posts" className="btn-primary px-6 py-3 text-base">
          Criar primeiro post
        </Link>
      </div>
    );
  }

  return <GaleriaDashboard posts={posts} nomeUsuario={session.user.name ?? ""} />;
}
