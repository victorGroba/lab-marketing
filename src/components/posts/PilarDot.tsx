const PILAR_CORES: Record<string, string> = {
  "Educacao em Saude": "bg-teal-400",
  "Qualidade":         "bg-teal-600",
  "Institucional":     "bg-gray-500",
  "Promocoes":         "bg-yellow-500",
  "Resultados":        "bg-green-500",
};

export function PilarDot({ pilar }: { pilar: string }) {
  const cor = PILAR_CORES[pilar] ?? "bg-gray-300";
  return (
    <span className="flex items-center gap-1.5 text-xs text-gray-500">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cor}`} />
      {pilar}
    </span>
  );
}
