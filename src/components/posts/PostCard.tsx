"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_STYLES: Record<string, { bg: string; dot: string; label: string }> = {
  RASCUNHO:  { bg: "bg-gray-100 text-gray-600",    dot: "bg-gray-400",   label: "Rascunho" },
  REVISAO:   { bg: "bg-amber-50 text-amber-700",   dot: "bg-amber-400",  label: "Em Revisao" },
  APROVADO:  { bg: "bg-teal-50 text-teal-700",     dot: "bg-teal-400",   label: "Aprovado" },
  PUBLICADO: { bg: "bg-teal-500 text-white",       dot: "bg-white",      label: "Publicado" },
};

const PILAR_COLORS: Record<string, string> = {
  "Educacao em Saude": "from-teal-400 to-teal-600",
  "Qualidade":         "from-teal-600 to-teal-800",
  "Institucional":     "from-gray-400 to-gray-600",
  "Promocoes":         "from-amber-400 to-amber-600",
  "Resultados":        "from-emerald-400 to-emerald-600",
};

type PostCardProps = {
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

export function PostCard({
  id, titulo, pilar, status, dataAgendada, legenda, hashtags, imagem, totalComentarios,
}: PostCardProps) {
  const st = STATUS_STYLES[status] ?? STATUS_STYLES.RASCUNHO;
  const gradiente = PILAR_COLORS[pilar] ?? "from-gray-300 to-gray-500";

  return (
    <Link href={`/posts/${id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">

        {/* Imagem ou placeholder */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {imagem ? (
            <img
              src={imagem}
              alt={titulo}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradiente} flex flex-col items-center justify-center p-4`}>
              <svg className="w-10 h-10 text-white/60 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-white/80 text-xs font-medium text-center leading-snug line-clamp-3">{titulo}</p>
            </div>
          )}

          {/* Badge de status sobreposto */}
          <div className="absolute top-2.5 left-2.5">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${st.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
              {st.label}
            </span>
          </div>

          {/* Data sobreposta */}
          {dataAgendada && (
            <div className="absolute top-2.5 right-2.5 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg font-medium">
              {format(new Date(dataAgendada), "dd MMM", { locale: ptBR })}
            </div>
          )}
        </div>

        {/* Conteudo */}
        <div className="p-4">
          {/* Pilar */}
          <div className="flex items-center gap-1.5 mb-2">
            <span className={`w-2 h-2 rounded-full bg-gradient-to-br ${gradiente}`} />
            <span className="text-xs text-gray-400 font-medium">{pilar}</span>
          </div>

          {/* Titulo */}
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-2 group-hover:text-teal-600 transition-colors">
            {titulo}
          </h3>

          {/* Legenda preview */}
          {legenda && (
            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-3">
              {legenda}
            </p>
          )}

          {/* Hashtags */}
          {hashtags && (
            <p className="text-xs text-teal-500 line-clamp-1 mb-3">
              {hashtags}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
            {dataAgendada ? (
              <span className="text-xs text-gray-400">
                {status === "PUBLICADO" ? "Publicado em " : "Agendado para "}
                <span className="font-medium text-gray-600">
                  {format(new Date(dataAgendada), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </span>
            ) : (
              <span className="text-xs text-gray-300 italic">Sem data</span>
            )}

            {totalComentarios > 0 && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {totalComentarios}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
