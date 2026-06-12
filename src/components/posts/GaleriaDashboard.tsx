"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { NovoPostModal } from "./NovoPostModal";
import { PILAR_GRADIENT, STATUS_LABELS, STATUS_ORDER } from "@/types";

type Post = {
  id: string;
  titulo: string;
  pilar: string;
  status: string;
  dataAgendada: Date | null;
  legenda: string | null;
  hashtags: string | null;
  imagem: string | null;
  totalComentarios: number;
};

const STATUS_BADGE: Record<string, string> = {
  RASCUNHO:  "bg-white/10 text-white/70 border-white/10",
  REVISAO:   "bg-amber-400/20 text-amber-300 border-amber-400/20",
  APROVADO:  "bg-teal-400/20 text-teal-300 border-teal-400/20",
  PUBLICADO: "bg-teal-400 text-white border-teal-400",
};

export function GaleriaDashboard({
  posts,
  nomeUsuario,
}: {
  posts: Post[];
  nomeUsuario: string;
}) {
  const [filtro, setFiltro] = useState("TODOS");
  const [mostrarModal, setMostrarModal] = useState(false);

  const postsFiltrados = filtro === "TODOS"
    ? posts
    : posts.filter((p) => p.status === filtro);

  const contadores: Record<string, number> = { TODOS: posts.length };
  STATUS_ORDER.forEach((s) => { contadores[s] = posts.filter((p) => p.status === s).length; });

  // Post em destaque (primeiro aprovado, ou primeiro da lista)
  const destaque = posts.find((p) => p.status === "APROVADO") ?? posts[0];

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Header fixo */}
      <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-white/5 px-6 lg:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-sm font-semibold text-white/90">
            Ola, {nomeUsuario.split(" ")[0]}
          </h1>
          {/* Filtros */}
          <div className="flex items-center gap-1 bg-white/5 rounded-full p-1">
            {["TODOS", ...STATUS_ORDER].map((s) => (
              <button
                key={s}
                onClick={() => setFiltro(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  filtro === s
                    ? "bg-white text-gray-900 shadow"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {s === "TODOS" ? "Todos" : STATUS_LABELS[s]}
                {contadores[s] > 0 && (
                  <span className={`ml-1.5 text-[10px] ${filtro === s ? "text-gray-500" : "text-white/30"}`}>
                    {contadores[s]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setMostrarModal(true)}
          className="flex items-center gap-1.5 bg-teal-400 hover:bg-teal-500 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Novo post
        </button>
      </header>

      <div className="px-6 lg:px-10 py-8 space-y-10">

        {/* Hero — post em destaque */}
        {filtro === "TODOS" && destaque && (
          <section>
            <Link href={`/posts/${destaque.id}`} className="group relative block rounded-3xl overflow-hidden aspect-[21/9] bg-gray-900">
              {destaque.imagem ? (
                <img
                  src={destaque.imagem}
                  alt={destaque.titulo}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${PILAR_GRADIENT[destaque.pilar] ?? "from-teal-600 to-teal-900"}`} />
              )}

              {/* Overlay gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

              {/* Conteudo sobreposto */}
              <div className="absolute bottom-0 left-0 p-8 lg:p-10 max-w-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border backdrop-blur-sm ${STATUS_BADGE[destaque.status]}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {STATUS_LABELS[destaque.status]}
                  </span>
                  <span className="text-white/40 text-xs">{destaque.pilar}</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-2 group-hover:text-teal-300 transition-colors">
                  {destaque.titulo}
                </h2>
                {destaque.legenda && (
                  <p className="text-white/60 text-sm line-clamp-2 leading-relaxed">{destaque.legenda}</p>
                )}
                {destaque.dataAgendada && (
                  <p className="text-white/40 text-xs mt-3">
                    {destaque.status === "PUBLICADO" ? "Publicado em " : "Agendado para "}
                    {format(new Date(destaque.dataAgendada), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                )}
              </div>

              {/* Seta de abertura */}
              <div className="absolute bottom-8 right-8 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </section>
        )}

        {/* Grade de posts */}
        {postsFiltrados.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                {filtro === "TODOS" ? "Todos os posts" : STATUS_LABELS[filtro]}
              </h3>
              <span className="text-xs text-white/30">{postsFiltrados.length} posts</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {postsFiltrados.map((post) => (
                <Link key={post.id} href={`/posts/${post.id}`} className="group block">
                  <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-gray-900">
                    {/* Imagem ou gradiente */}
                    {post.imagem ? (
                      <img
                        src={post.imagem}
                        alt={post.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${PILAR_GRADIENT[post.pilar] ?? "from-gray-700 to-gray-900"}`} />
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                    {/* Status badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-sm ${STATUS_BADGE[post.status]}`}>
                        {STATUS_LABELS[post.status]}
                      </span>
                    </div>

                    {/* Sem imagem indicator */}
                    {!post.imagem && (
                      <div className="absolute top-3 right-3">
                        <span className="w-6 h-6 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center">
                          <svg className="w-3 h-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                          </svg>
                        </span>
                      </div>
                    )}

                    {/* Info inferior */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white text-xs font-semibold leading-snug line-clamp-2 group-hover:text-teal-300 transition-colors">
                        {post.titulo}
                      </p>
                      {post.dataAgendada && (
                        <p className="text-white/40 text-[10px] mt-1">
                          {format(new Date(post.dataAgendada), "dd MMM yyyy", { locale: ptBR })}
                        </p>
                      )}
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-teal-400/50 rounded-2xl transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {postsFiltrados.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="text-white/20 text-lg">Nenhum post com este status.</p>
          </div>
        )}
      </div>

      {mostrarModal && <NovoPostModal onClose={() => setMostrarModal(false)} />}
    </div>
  );
}
