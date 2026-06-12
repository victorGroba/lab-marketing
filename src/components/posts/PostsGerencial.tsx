"use client";

import { useState } from "react";
import { PostCard } from "./PostCard";
import { NovoPostModal } from "./NovoPostModal";
import { STATUS_LABELS, STATUS_ORDER, PILARES } from "@/types";

type Post = {
  id: string;
  titulo: string;
  pilar: string;
  status: string;
  dataAgendada: Date | null;
  legenda: string | null;
  hashtags: string | null;
  imagens: { caminhoArquivo: string }[];
  comentarios: { id: string }[];
};

const STATUS_CHIP: Record<string, string> = {
  TODOS:     "bg-gray-900 text-white",
  RASCUNHO:  "bg-gray-100 text-gray-700 hover:bg-gray-200",
  REVISAO:   "bg-amber-50 text-amber-700 hover:bg-amber-100",
  APROVADO:  "bg-teal-50 text-teal-700 hover:bg-teal-100",
  PUBLICADO: "bg-teal-500 text-white hover:bg-teal-600",
};

export function PostsGerencial({ posts }: { posts: Post[] }) {
  const [filtroStatus, setFiltroStatus] = useState("TODOS");
  const [filtroPilar, setFiltroPilar] = useState("TODOS");
  const [busca, setBusca] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);

  const postsFiltrados = posts.filter((p) => {
    const okStatus = filtroStatus === "TODOS" || p.status === filtroStatus;
    const okPilar = filtroPilar === "TODOS" || p.pilar === filtroPilar;
    const okBusca =
      !busca ||
      p.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      (p.legenda ?? "").toLowerCase().includes(busca.toLowerCase()) ||
      (p.hashtags ?? "").toLowerCase().includes(busca.toLowerCase());
    return okStatus && okPilar && okBusca;
  });

  const contadores: Record<string, number> = { TODOS: posts.length };
  STATUS_ORDER.forEach((s) => { contadores[s] = posts.filter((p) => p.status === s).length; });

  return (
    <div className="space-y-6">
      {/* Barra superior */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-56">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar posts..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="input-search"
          />
        </div>

        <select
          value={filtroPilar}
          onChange={(e) => setFiltroPilar(e.target.value)}
          className="input w-auto text-sm"
        >
          <option value="TODOS">Todos os pilares</option>
          {PILARES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>

        <button onClick={() => setMostrarModal(true)} className="btn-primary">
          + Novo Post
        </button>
      </div>

      {/* Chips de status */}
      <div className="flex flex-wrap gap-2">
        {["TODOS", ...STATUS_ORDER].map((s) => {
          const ativo = filtroStatus === s;
          return (
            <button
              key={s}
              onClick={() => setFiltroStatus(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                ativo
                  ? "bg-teal-400 text-white border-teal-400 shadow-sm"
                  : "bg-white text-gray-500 border-gray-200 hover:border-teal-300 hover:text-teal-600"
              }`}
            >
              {s === "TODOS" ? "Todos" : STATUS_LABELS[s]}
              <span className="ml-1.5 opacity-60">{contadores[s]}</span>
            </button>
          );
        })}
      </div>

      {/* Grade de cards */}
      {postsFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-300">
          <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">Nenhum post encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {postsFiltrados.map((post) => (
            <PostCard
              key={post.id}
              id={post.id}
              titulo={post.titulo}
              pilar={post.pilar}
              status={post.status}
              dataAgendada={post.dataAgendada}
              legenda={post.legenda}
              hashtags={post.hashtags}
              imagem={post.imagens[0]?.caminhoArquivo ?? null}
              totalComentarios={post.comentarios.length}
            />
          ))}
        </div>
      )}

      {mostrarModal && <NovoPostModal onClose={() => setMostrarModal(false)} />}
    </div>
  );
}
