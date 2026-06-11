import { STATUS_LABELS } from "@/types";

const STATUS_STYLES: Record<string, string> = {
  RASCUNHO:  "bg-gray-100 text-gray-600 border-gray-200",
  REVISAO:   "bg-yellow-50 text-yellow-700 border-yellow-200",
  APROVADO:  "bg-teal-50 text-teal-700 border-teal-200",
  PUBLICADO: "bg-teal-500 text-white border-teal-500",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge border text-xs ${STATUS_STYLES[status] ?? ""}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
