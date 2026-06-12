"use client";

import { useTransition } from "react";
import { excluirPostAction } from "@/app/(dashboard)/posts/[id]/actions";

export function BotaoExcluirPost({ postId }: { postId: string }) {
  const [pending, startTransition] = useTransition();

  function handleExcluir() {
    if (!confirm("Excluir este post? Esta acao nao pode ser desfeita.")) return;
    startTransition(async () => {
      await excluirPostAction(postId);
    });
  }

  return (
    <button
      onClick={handleExcluir}
      disabled={pending}
      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      {pending ? "Excluindo..." : "Excluir post"}
    </button>
  );
}
