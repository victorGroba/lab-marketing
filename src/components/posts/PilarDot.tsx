import { PILAR_DOT } from "@/types";

export function PilarDot({ pilar }: { pilar: string }) {
  const cor = PILAR_DOT[pilar] ?? "bg-gray-300";
  return (
    <span className="flex items-center gap-1.5 text-xs text-gray-500">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cor}`} />
      {pilar}
    </span>
  );
}
