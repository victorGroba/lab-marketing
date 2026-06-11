"use client";

import { useState } from "react";
import Link from "next/link";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { StatusBadge } from "./StatusBadge";
import { PilarDot } from "./PilarDot";
import { NovoPostModal } from "./NovoPostModal";

type PostResumido = {
  id: string;
  titulo: string;
  pilar: string;
  status: string;
  dataAgendada: Date | null;
};

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

export function CalendarioMensal({ posts }: { posts: PostResumido[] }) {
  const hoje = new Date();
  const [mesAtual, setMesAtual] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
  const [mostrarModal, setMostrarModal] = useState(false);
  const [visualizacao, setVisualizacao] = useState<"calendario" | "lista">("calendario");

  const diasDoMes = eachDayOfInterval({
    start: startOfMonth(mesAtual),
    end: endOfMonth(mesAtual),
  });

  const offsetInicial = getDay(startOfMonth(mesAtual));
  const celulasVazias = Array.from({ length: offsetInicial });

  function postsNoDia(dia: Date) {
    return posts.filter(
      (p) => p.dataAgendada && isSameDay(new Date(p.dataAgendada), dia)
    );
  }

  function avancarMes() {
    setMesAtual((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  }

  function voltarMes() {
    setMesAtual((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  }

  const postsSemData = posts.filter((p) => !p.dataAgendada);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">
            {format(mesAtual, "MMMM yyyy", { locale: ptBR }).replace(/^\w/, (c) => c.toUpperCase())}
          </h1>
          <div className="flex gap-1">
            <button onClick={voltarMes} className="btn-secondary px-2 py-1 text-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setMesAtual(new Date(hoje.getFullYear(), hoje.getMonth(), 1))}
              className="btn-secondary px-2 py-1 text-xs"
            >
              Hoje
            </button>
            <button onClick={avancarMes} className="btn-secondary px-2 py-1 text-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setVisualizacao("calendario")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                visualizacao === "calendario"
                  ? "bg-teal-400 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Calendario
            </button>
            <button
              onClick={() => setVisualizacao("lista")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                visualizacao === "lista"
                  ? "bg-teal-400 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Lista
            </button>
          </div>
          <button onClick={() => setMostrarModal(true)} className="btn-primary text-sm">
            + Novo Post
          </button>
        </div>
      </div>

      {visualizacao === "calendario" ? (
        <div className="card overflow-hidden">
          {/* Cabecalho dias semana */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DIAS_SEMANA.map((d) => (
              <div key={d} className="py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {d}
              </div>
            ))}
          </div>

          {/* Celulas */}
          <div className="grid grid-cols-7">
            {celulasVazias.map((_, i) => (
              <div key={`vazio-${i}`} className="min-h-[110px] border-b border-r border-gray-100 bg-gray-50/50" />
            ))}

            {diasDoMes.map((dia, i) => {
              const postsHoje = postsNoDia(dia);
              const ehHoje = isToday(dia);
              const isUltimaColuna = (offsetInicial + i + 1) % 7 === 0;

              return (
                <div
                  key={dia.toISOString()}
                  className={`min-h-[110px] p-2 border-b border-r border-gray-100 ${
                    isUltimaColuna ? "border-r-0" : ""
                  } ${ehHoje ? "bg-teal-50/30" : ""}`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mb-1 ${
                      ehHoje
                        ? "bg-teal-400 text-white"
                        : "text-gray-600"
                    }`}
                  >
                    {format(dia, "d")}
                  </span>

                  <div className="space-y-1">
                    {postsHoje.slice(0, 2).map((p) => (
                      <Link
                        key={p.id}
                        href={`/posts/${p.id}`}
                        className="block rounded-md px-1.5 py-1 text-xs leading-tight hover:opacity-80 transition-opacity bg-white border border-gray-200 shadow-sm"
                      >
                        <span className="font-medium text-gray-800 block truncate">{p.titulo}</span>
                        <PilarDot pilar={p.pilar} />
                        <div className="mt-0.5">
                          <StatusBadge status={p.status} />
                        </div>
                      </Link>
                    ))}
                    {postsHoje.length > 2 && (
                      <p className="text-xs text-gray-400 pl-1">+{postsHoje.length - 2} mais</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Visao lista */
        <div className="space-y-2">
          {posts.length === 0 && (
            <div className="card p-8 text-center text-gray-400">Nenhum post agendado neste mes.</div>
          )}
          {posts
            .filter((p) => p.dataAgendada)
            .map((p) => (
              <Link key={p.id} href={`/posts/${p.id}`} className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow block">
                <div className="text-center w-12 flex-shrink-0">
                  <p className="text-lg font-bold text-teal-500">
                    {p.dataAgendada ? format(new Date(p.dataAgendada), "dd") : "--"}
                  </p>
                  <p className="text-xs text-gray-400 uppercase">
                    {p.dataAgendada ? format(new Date(p.dataAgendada), "MMM", { locale: ptBR }) : ""}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{p.titulo}</p>
                  <PilarDot pilar={p.pilar} />
                </div>
                <StatusBadge status={p.status} />
              </Link>
            ))}
        </div>
      )}

      {/* Posts sem data */}
      {postsSemData.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Sem data agendada ({postsSemData.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {postsSemData.map((p) => (
              <Link key={p.id} href={`/posts/${p.id}`} className="card p-4 hover:shadow-md transition-shadow block">
                <p className="font-medium text-gray-900 truncate mb-1">{p.titulo}</p>
                <PilarDot pilar={p.pilar} />
                <div className="mt-2">
                  <StatusBadge status={p.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {mostrarModal && <NovoPostModal onClose={() => setMostrarModal(false)} />}
    </div>
  );
}
