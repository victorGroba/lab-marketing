"use client";

import { useState } from "react";
import Link from "next/link";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { NovoPostModal } from "./NovoPostModal";

type PostResumido = {
  id: string;
  titulo: string;
  pilar: string;
  status: string;
  dataAgendada: Date | null;
  imagem: string | null;
};

const STATUS_DOT: Record<string, string> = {
  RASCUNHO:  "bg-gray-300",
  REVISAO:   "bg-amber-400",
  APROVADO:  "bg-teal-400",
  PUBLICADO: "bg-teal-600",
};

const PILAR_COLORS: Record<string, string> = {
  "Educacao em Saude": "from-teal-400 to-teal-600",
  "Qualidade":         "from-teal-600 to-teal-800",
  "Institucional":     "from-gray-400 to-gray-600",
  "Promocoes":         "from-amber-400 to-amber-600",
  "Resultados":        "from-emerald-400 to-emerald-600",
};

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

export function CalendarioMensal({ posts }: { posts: PostResumido[] }) {
  const hoje = new Date();
  const [mesAtual, setMesAtual] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
  const [mostrarModal, setMostrarModal] = useState(false);

  const diasDoMes = eachDayOfInterval({ start: startOfMonth(mesAtual), end: endOfMonth(mesAtual) });
  const offsetInicial = getDay(startOfMonth(mesAtual));
  const celulasVazias = Array.from({ length: offsetInicial });

  function postsNoDia(dia: Date) {
    return posts.filter((p) => p.dataAgendada && isSameDay(new Date(p.dataAgendada), dia));
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900 capitalize">
            {format(mesAtual, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <div className="flex gap-1">
            <button
              onClick={() => setMesAtual((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setMesAtual(new Date(hoje.getFullYear(), hoje.getMonth(), 1))}
              className="px-3 h-8 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
            >
              Hoje
            </button>
            <button
              onClick={() => setMesAtual((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <button onClick={() => setMostrarModal(true)} className="btn-primary text-sm">
          + Novo Post
        </button>
      </div>

      {/* Grade */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Dias da semana */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DIAS_SEMANA.map((d) => (
            <div key={d} className="py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-widest">
              {d}
            </div>
          ))}
        </div>

        {/* Celulas */}
        <div className="grid grid-cols-7">
          {celulasVazias.map((_, i) => (
            <div key={`v${i}`} className="min-h-[130px] border-b border-r border-gray-50 bg-gray-50/40" />
          ))}

          {diasDoMes.map((dia, i) => {
            const postsHoje = postsNoDia(dia);
            const ehHoje = isToday(dia);
            const isUltCol = (offsetInicial + i + 1) % 7 === 0;

            return (
              <div
                key={dia.toISOString()}
                className={`min-h-[130px] p-2 border-b border-gray-50 transition-colors ${
                  isUltCol ? "" : "border-r"
                } ${ehHoje ? "bg-teal-50/30" : "hover:bg-gray-50/60"}`}
              >
                {/* Numero do dia */}
                <div className="flex justify-between items-start mb-1.5">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                      ehHoje ? "bg-teal-400 text-white" : "text-gray-500"
                    }`}
                  >
                    {format(dia, "d")}
                  </span>
                </div>

                {/* Posts */}
                <div className="space-y-1.5">
                  {postsHoje.slice(0, 2).map((p) => {
                    const gradiente = PILAR_COLORS[p.pilar] ?? "from-gray-300 to-gray-500";
                    return (
                      <Link key={p.id} href={`/posts/${p.id}`} className="block group">
                        <div className="relative rounded-xl overflow-hidden aspect-square w-full bg-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
                          {p.imagem ? (
                            <img
                              src={p.imagem}
                              alt={p.titulo}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${gradiente} flex items-center justify-center p-1`}>
                              <p className="text-white/80 text-[9px] font-medium text-center leading-tight line-clamp-3">
                                {p.titulo}
                              </p>
                            </div>
                          )}

                          {/* Status dot */}
                          <div className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full border-2 border-white shadow ${STATUS_DOT[p.status]}`} />
                        </div>
                      </Link>
                    );
                  })}

                  {postsHoje.length > 2 && (
                    <p className="text-[10px] text-gray-400 text-center">+{postsHoje.length - 2}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap items-center gap-5 text-xs text-gray-400">
        <span className="font-medium text-gray-500">Status:</span>
        {[
          { label: "Rascunho", cor: "bg-gray-300" },
          { label: "Em Revisao", cor: "bg-amber-400" },
          { label: "Aprovado", cor: "bg-teal-400" },
          { label: "Publicado", cor: "bg-teal-600" },
        ].map((s) => (
          <span key={s.label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${s.cor}`} />
            {s.label}
          </span>
        ))}
      </div>

      {mostrarModal && <NovoPostModal onClose={() => setMostrarModal(false)} />}
    </div>
  );
}
