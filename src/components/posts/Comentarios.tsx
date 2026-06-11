"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { adicionarComentarioAction } from "@/app/(dashboard)/posts/[id]/actions";

type Comentario = {
  id: string;
  texto: string;
  criadoEm: Date;
  autor: { nome: string; papel: string };
};

export function Comentarios({ postId, comentarios }: { postId: string; comentarios: Comentario[] }) {
  const router = useRouter();
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState("");
  const [pending, startTransition] = useTransition();

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    startTransition(async () => {
      const result = await adicionarComentarioAction(postId, texto);
      if (result.erro) { setErro(result.erro); return; }
      setTexto("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {/* Lista */}
      {comentarios.length === 0 ? (
        <p className="text-sm text-gray-400 italic">Nenhum comentario ainda.</p>
      ) : (
        <div className="space-y-3">
          {comentarios.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-xs flex-shrink-0 mt-0.5">
                {c.autor.nome.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">{c.autor.nome}</span>
                  <span className="text-xs text-gray-400">
                    {format(new Date(c.criadoEm), "dd MMM yyyy 'as' HH:mm", { locale: ptBR })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.texto}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={enviar} className="space-y-2">
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={3}
          placeholder="Adicionar comentario..."
          className="input resize-none"
          required
        />
        {erro && <p className="text-sm text-red-600">{erro}</p>}
        <div className="flex justify-end">
          <button type="submit" disabled={pending || !texto.trim()} className="btn-primary text-sm">
            {pending ? "Enviando..." : "Comentar"}
          </button>
        </div>
      </form>
    </div>
  );
}
