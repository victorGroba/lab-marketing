export type { Papel, StatusPost, Post, User, Imagem, Comentario, Historico } from "@prisma/client";

export const PILARES = [
  "Educacao em Saude",
  "Qualidade",
  "Institucional",
  "Promocoes",
  "Resultados",
] as const;

export type Pilar = (typeof PILARES)[number];

export const STATUS_LABELS: Record<string, string> = {
  RASCUNHO:  "Rascunho",
  REVISAO:   "Em Revisao",
  APROVADO:  "Aprovado",
  PUBLICADO: "Publicado",
};

export const STATUS_COLORS: Record<string, string> = {
  RASCUNHO:  "bg-gray-200 text-gray-700",
  REVISAO:   "bg-yellow-100 text-yellow-800",
  APROVADO:  "bg-teal-100 text-teal-700",
  PUBLICADO: "bg-teal-500 text-white",
};

export const PILAR_COLORS: Record<string, string> = {
  "Educacao em Saude": "border-l-teal-400",
  "Qualidade":         "border-l-teal-600",
  "Institucional":     "border-l-gray-500",
  "Promocoes":         "border-l-yellow-500",
  "Resultados":        "border-l-green-500",
};

export const PILAR_GRADIENT: Record<string, string> = {
  "Educacao em Saude": "from-teal-400 to-teal-600",
  "Qualidade":         "from-teal-600 to-teal-800",
  "Institucional":     "from-gray-400 to-gray-600",
  "Promocoes":         "from-amber-400 to-amber-600",
  "Resultados":        "from-emerald-400 to-emerald-600",
};

export const PILAR_DOT: Record<string, string> = {
  "Educacao em Saude": "bg-teal-400",
  "Qualidade":         "bg-teal-600",
  "Institucional":     "bg-gray-500",
  "Promocoes":         "bg-amber-500",
  "Resultados":        "bg-emerald-500",
};

export const STATUS_FLOW: Record<string, string | null> = {
  RASCUNHO:  "REVISAO",
  REVISAO:   "APROVADO",
  APROVADO:  "PUBLICADO",
  PUBLICADO: null,
};

export const STATUS_FLOW_LABELS: Record<string, string> = {
  RASCUNHO:  "Enviar para Revisao",
  REVISAO:   "Aprovar",
  APROVADO:  "Marcar como Publicado",
};
