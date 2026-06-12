"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { StatusBadge } from "./StatusBadge";
import { PilarDot } from "./PilarDot";
import { NovoPostModal } from "./NovoPostModal";
import { STATUS_LABELS } from "@/types";

type Post = {
  id: string;
  titulo: string;
  pilar: string;
  status: string;
  dataAgendada: Date | null;
  baseNormativa: string | null;
  legenda: string | null;
  hashtags: string | null;
  criadoEm: Date;
  criadoPor: { nome: string; papel: string };
  imagens: { id: string }[];
  comentarios: { id: string }[];
};

const STATUS_ORDER = ["RASCUNHO", "REVISAO", "APROVADO", "PUBLICADO"];
const PILARES = ["Educacao em Saude", "Qualidade", "Institucional", "Promocoes", "Resultados"];

export function PostsGerencial({ posts }: { posts: Post[] }) {
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");
  const [filtroPilar, setFiltroPilar] = useState<string>("TODOS");
  const [busca, setBusca] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);

  const postsFiltrados = posts.filter((p) => {
    const okStatus = filtroStatus === "TODOS" || p.status === filtroStatus;
    const okPilar = filtroPilar === "TODOS" || p.pilar === filtroPilar;
    const okBusca =
      busca === "" ||
      p.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      (p.legenda ?? "").toLowerCase().includes(busca.toLowerCase()) ||
      (p.hashtags ?? "").toLowerCase().includes(busca.toLowerCase());
    return okStatus && okPilar && okBusca;
  });

  // Contadores por status
  const contadores = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = posts.filter((p) => p.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        {/* Busca */}
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por titulo, legenda ou hashtag..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="input pl-9 text-sm"
          />
        </div>

        {/* Filtro status */}
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="input w-auto text-sm"
        >
          <option value="TODOS">Todos os status</option>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]} ({contadores[s] ?? 0})
            </option>
          ))}
        </select>

        {/* Filtro pilar */}
        <select
          value={filtroPilar}
          onChange={(e) => setFiltroPilar(e.target.value)}
          className="input w-auto text-sm"
        >
          <option value="TODOS">Todos os pilares</option>
          {PILARES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <button onClick={() => setMostrarModal(true)} className="btn-primary text-sm ml-auto">
          + Novo Post
        </button>
      </div>

      {/* Chips de status */}
      <div className="flex flex-wrap gap-2">
        {STATUS_ORDER.map((s) => (
          <button
            key={s}
            onClick={() => setFiltroStatus(filtroStatus === s ? "TODOS" : s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filtroStatus === s
                ? "bg-teal-400 text-white border-teal-400"
                : "bg-white text-gray-600 border-gray-200 hover:border-teal-300"
            }`}
          >
            {STATUS_LABELS[s]} {contadores[s] > 0 && <span className="ml-1 opacity-75">{contadores[s]}</span>}
          </button>
        ))}
      </div>

      {/* Resultado */}
      <p className="text-xs text-gray-400">
        {postsFiltrados.length} {postsFiltrados.length === 1 ? "post encontrado" : "posts encontrados"}
      </p>

      {/* Tabela */}
      {postsFiltrados.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          Nenhum post encontrado com esses filtros.
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Post</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Pilar</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Agendado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Criado por</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Imgs</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Coment.</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {postsFiltrados.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  {/* Titulo */}
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900 leading-tight">{post.titulo}</p>
                    {post.baseNormativa && (
                      <p className="text-xs text-gray-400 mt-0.5">{post.baseNormativa}</p>
                    )}
                    {post.legenda && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-xs">{post.legenda}</p>
                    )}
                  </td>

                  {/* Pilar */}
                  <td className="px-4 py-4 hidden md:table-cell">
                    <PilarDot pilar={post.pilar} />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <StatusBadge status={post.status} />
                  </td>

                  {/* Data */}
                  <td className="px-4 py-4 hidden lg:table-cell text-gray-600">
                    {post.dataAgendada
                      ? format(new Date(post.dataAgendada), "dd/MM/yyyy", { locale: ptBR })
                      : <span className="text-gray-300 italic">Sem data</span>}
                  </td>

                  {/* Criado por */}
                  <td className="px-4 py-4 hidden lg:table-cell text-gray-500 text-xs">
                    {post.criadoPor.nome}
                  </td>

                  {/* Imagens */}
                  <td className="px-4 py-4 text-center hidden md:table-cell">
                    <span className={`text-xs font-medium ${post.imagens.length > 0 ? "text-teal-600" : "text-gray-300"}`}>
                      {post.imagens.length > 0 ? post.imagens.length : "-"}
                    </span>
                  </td>

                  {/* Comentarios */}
                  <td className="px-4 py-4 text-center hidden md:table-cell">
                    <span className={`text-xs font-medium ${post.comentarios.length > 0 ? "text-teal-600" : "text-gray-300"}`}>
                      {post.comentarios.length > 0 ? post.comentarios.length : "-"}
                    </span>
                  </td>

                  {/* Acao */}
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/posts/${post.id}`}
                      className="text-teal-500 hover:text-teal-700 text-xs font-medium transition-colors whitespace-nowrap"
                    >
                      Abrir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {mostrarModal && <NovoPostModal onClose={() => setMostrarModal(false)} />}
    </div>
  );
}
