"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { criarPostAction } from "@/app/(dashboard)/dashboard/actions";

const PILARES = [
  "Educacao em Saude",
  "Qualidade",
  "Institucional",
  "Promocoes",
  "Resultados",
];

export function NovoPostModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await criarPostAction(fd);
      if (result.erro) {
        setErro(result.erro);
        return;
      }
      onClose();
      router.push(`/posts/${result.id}`);
      router.refresh();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Novo Post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Titulo *</label>
            <input name="titulo" required className="input" placeholder="Titulo do post" />
          </div>

          <div>
            <label className="label">Pilar *</label>
            <select name="pilar" required className="input">
              <option value="">Selecione um pilar</option>
              {PILARES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Data agendada</label>
            <input name="dataAgendada" type="date" className="input" />
          </div>

          {erro && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {erro}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" disabled={pending} className="btn-primary flex-1">
              {pending ? "Criando..." : "Criar Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
