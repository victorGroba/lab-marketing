import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { STATUS_LABELS } from "@/types";

type HistoricoItem = {
  id: string;
  campo: string;
  valorAntigo: string | null;
  valorNovo: string | null;
  criadoEm: Date;
  autor: { nome: string };
};

const CAMPO_LABELS: Record<string, string> = {
  status:         "Status",
  titulo:         "Titulo",
  pilar:          "Pilar",
  baseNormativa:  "Base Normativa",
  textoArte:      "Texto da Arte",
  legenda:        "Legenda",
  hashtags:       "Hashtags",
  promptImagem:   "Prompt de Imagem",
  dataAgendada:   "Data Agendada",
};

function formatarValor(campo: string, valor: string | null): string {
  if (!valor) return "(vazio)";
  if (campo === "status") return STATUS_LABELS[valor] ?? valor;
  if (campo === "dataAgendada") return format(new Date(valor), "dd/MM/yyyy", { locale: ptBR });
  if (valor.length > 60) return valor.slice(0, 60) + "...";
  return valor;
}

export function HistoricoTimeline({ historico }: { historico: HistoricoItem[] }) {
  if (historico.length === 0) {
    return <p className="text-sm text-gray-400 italic">Nenhuma alteracao registrada.</p>;
  }

  return (
    <ol className="relative border-l border-gray-200 space-y-4 ml-2">
      {historico.map((h) => (
        <li key={h.id} className="ml-4">
          <div className="absolute -left-1.5 w-3 h-3 rounded-full bg-teal-400 border-2 border-white" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-400">
              {format(new Date(h.criadoEm), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })} por{" "}
              <span className="font-medium text-gray-600">{h.autor.nome}</span>
            </span>
            <p className="text-sm text-gray-700">
              <span className="font-medium">{CAMPO_LABELS[h.campo] ?? h.campo}:</span>{" "}
              {h.valorAntigo !== null ? (
                <>
                  <span className="line-through text-gray-400">{formatarValor(h.campo, h.valorAntigo)}</span>
                  {" "}<span className="text-gray-400">-&gt;</span>{" "}
                </>
              ) : null}
              <span className="text-teal-700 font-medium">{formatarValor(h.campo, h.valorNovo)}</span>
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
