import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format, isThisWeek, isThisMonth, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { StatusBadge } from "@/components/posts/StatusBadge";
import { PilarDot } from "@/components/posts/PilarDot";
import { STATUS_ORDER, STATUS_LABELS } from "@/types";

async function getDados() {
  const posts = await prisma.post.findMany({
    include: {
      criadoPor: { select: { nome: true } },
      imagens: { select: { caminhoArquivo: true }, orderBy: { versao: "asc" }, take: 1 },
    },
    orderBy: { dataAgendada: "asc" },
  });
  return posts.map((p) => ({ ...p, imagem: p.imagens[0]?.caminhoArquivo ?? null }));
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const posts = await getDados();

  if (posts.length === 0) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Nenhum post criado ainda</h2>
        <p className="text-sm text-gray-400 mb-6">Comece criando o primeiro post do laboratorio no Instagram.</p>
        <Link href="/posts" className="btn-primary">Criar primeiro post</Link>
      </div>
    );
  }

  const prontos      = posts.filter((p) => p.status === "APROVADO");
  const emRevisao    = posts.filter((p) => p.status === "REVISAO");
  const agendados    = posts.filter((p) => p.status !== "PUBLICADO" && p.dataAgendada && !isPast(new Date(p.dataAgendada)));
  const publicados   = posts.filter((p) => p.status === "PUBLICADO");
  const semFoto      = posts.filter((p) => p.status !== "PUBLICADO" && !p.imagem);

  const resumo = STATUS_ORDER.map((s) => ({
    status: s,
    label: STATUS_LABELS[s],
    qtd: posts.filter((p) => p.status === s).length,
  }));

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">

      {/* Saudacao */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Boa tarde, {session.user.name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {posts.length} {posts.length === 1 ? "post" : "posts"} no plano de conteudo
        </p>
      </div>

      {/* Alertas */}
      {(prontos.length > 0 || semFoto.length > 0) && (
        <div className="space-y-3">
          {prontos.length > 0 && (
            <div className="flex items-center gap-3 bg-teal-50 border border-teal-100 rounded-xl px-4 py-3">
              <span className="w-2 h-2 rounded-full bg-teal-400 flex-shrink-0" />
              <p className="text-sm text-teal-700">
                <span className="font-semibold">{prontos.length} {prontos.length === 1 ? "post aprovado" : "posts aprovados"}</span>
                {" "}pronto{prontos.length > 1 ? "s" : ""} para publicar no Instagram.
              </p>
              <Link href="/posts?status=APROVADO" className="ml-auto text-xs font-medium text-teal-600 hover:text-teal-800 whitespace-nowrap">Ver posts</Link>
            </div>
          )}
          {semFoto.length > 0 && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                <span className="font-semibold">{semFoto.length} {semFoto.length === 1 ? "post" : "posts"}</span>
                {" "}ainda sem imagem anexada.
              </p>
              <Link href="/posts" className="ml-auto text-xs font-medium text-amber-600 hover:text-amber-800 whitespace-nowrap">Ver posts</Link>
            </div>
          )}
        </div>
      )}

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {resumo.map(({ status, label, qtd }) => (
          <Link key={status} href={`/posts?status=${status}`} className="card p-4 hover:shadow-md transition-shadow group">
            <StatusBadge status={status} />
            <p className="text-3xl font-bold text-gray-900 mt-3">{qtd}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Proximos a publicar */}
        <section className="card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Proximos agendados</h2>
          {agendados.length === 0 ? (
            <p className="text-sm text-gray-300 italic">Nenhum post agendado.</p>
          ) : (
            <div className="space-y-3">
              {agendados.slice(0, 5).map((p) => (
                <Link key={p.id} href={`/posts/${p.id}`} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    {p.imagem
                      ? <img src={p.imagem} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-gradient-to-br from-teal-400 to-teal-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-teal-600 transition-colors">{p.titulo}</p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(p.dataAgendada!), "dd 'de' MMMM", { locale: ptBR })}
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </Link>
              ))}
              {agendados.length > 5 && (
                <Link href="/posts" className="text-xs text-teal-500 hover:text-teal-700">
                  Ver mais {agendados.length - 5} posts
                </Link>
              )}
            </div>
          )}
        </section>

        {/* Publicados recentemente */}
        <section className="card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Publicados recentemente</h2>
          {publicados.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-300 italic">Nenhum post publicado ainda.</p>
              <p className="text-xs text-gray-300 mt-1">Quando publicar no Instagram, volte aqui e marque o post como Publicado.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {publicados.slice(0, 5).map((p) => (
                <Link key={p.id} href={`/posts/${p.id}`} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    {p.imagem
                      ? <img src={p.imagem} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-gradient-to-br from-teal-400 to-teal-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-teal-600 transition-colors">{p.titulo}</p>
                    <PilarDot pilar={p.pilar} />
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {p.dataAgendada ? format(new Date(p.dataAgendada), "dd/MM/yy") : ""}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Em revisao */}
      {emRevisao.length > 0 && (
        <section className="card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Aguardando revisao
            <span className="ml-2 text-xs font-normal text-gray-400">{emRevisao.length}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {emRevisao.map((p) => (
              <Link key={p.id} href={`/posts/${p.id}`} className="flex items-center gap-3 p-3 rounded-xl border border-amber-100 bg-amber-50/50 hover:bg-amber-50 transition-colors group">
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  {p.imagem
                    ? <img src={p.imagem} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate group-hover:text-teal-600 transition-colors">{p.titulo}</p>
                  <p className="text-xs text-gray-400">{p.criadoPor.nome}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
