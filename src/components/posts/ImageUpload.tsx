"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";

type Imagem = {
  id: string;
  caminhoArquivo: string;
  versao: number;
  enviadoEm: Date;
};

export function ImageUpload({ postId, imagens }: { postId: string; imagens: Imagem[] }) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    async (arquivos: File[]) => {
      const arquivo = arquivos[0];
      if (!arquivo) return;

      setErro("");
      setPreview(URL.createObjectURL(arquivo));
      setEnviando(true);

      const fd = new FormData();
      fd.append("arquivo", arquivo);
      fd.append("postId", postId);

      try {
        const res = await fetch("/api/uploads", { method: "POST", body: fd });
        const json = await res.json();
        if (!res.ok) { setErro(json.erro ?? "Erro ao enviar"); return; }
        router.refresh();
      } catch {
        setErro("Falha no envio. Tente novamente.");
      } finally {
        setEnviando(false);
        setPreview(null);
      }
    },
    [postId, router]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    disabled: enviando,
  });

  async function excluir(imagemId: string) {
    const { excluirImagemAction } = await import("@/app/(dashboard)/posts/[id]/actions");
    await excluirImagemAction(imagemId, postId);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Zona de drop */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-teal-400 bg-teal-50"
            : "border-gray-200 hover:border-teal-300 hover:bg-gray-50"
        } ${enviando ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />

        {preview ? (
          <img src={preview} alt="Preview" className="mx-auto max-h-32 rounded-lg object-contain" />
        ) : (
          <>
            <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-500">
              {enviando ? "Enviando..." : "Arraste uma imagem ou clique para selecionar"}
            </p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP ate 10 MB</p>
          </>
        )}
      </div>

      {erro && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{erro}</p>
      )}

      {/* Galeria */}
      {imagens.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {imagens.map((img) => (
            <div key={img.id} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-50">
              <img
                src={img.caminhoArquivo}
                alt={`Versao ${img.versao}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                  <a
                    href={img.caminhoArquivo}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white rounded-lg p-1.5 hover:bg-gray-100"
                    title="Ver original"
                  >
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </a>
                  <button
                    onClick={() => excluir(img.id)}
                    className="bg-white rounded-lg p-1.5 hover:bg-red-50"
                    title="Excluir"
                  >
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <span className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                v{img.versao}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
