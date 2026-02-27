"use client";

import { useMemo, useState, useTransition } from "react";
import { compress, type CompressResult } from "@/actions/compress";

const formatOptions = [
  { label: "JPEG", value: "jpeg" },
  { label: "PNG", value: "png" },
  { label: "WebP", value: "webp" },
  { label: "AVIF", value: "avif" }
] as const;

const qualityOptions = [
  { label: "Baixa", value: "low" },
  { label: "Média", value: "medium" },
  { label: "Alta", value: "high" }
] as const;

export default function ImageCompressorPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState("webp");
  const [quality, setQuality] = useState("medium");
  const [results, setResults] = useState<CompressResult[]>([]);
  const [isPending, startTransition] = useTransition();

  const originals = useMemo(() => {
    const map = new Map<string, string>();
    files.forEach((f) => map.set(f.name, URL.createObjectURL(f)));
    return map;
  }, [files]);

  const onSubmit = async () => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.set("format", format);
    formData.set("quality", quality);

    startTransition(async () => {
      const res = await compress(formData);
      setResults(res);
    });
  };

  return (
    <main className="min-h-screen bg-bg text-text">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-3xl font-display font-[500]">Compactador de Imagem</h1>
        <p className="mt-2 text-textMuted">
          Escolha formato e qualidade, visualize o antes/depois e baixe os arquivos.
        </p>

        <div className="mt-8 grid gap-6 rounded-lg border border-border bg-card p-6 shadow-soft">
          <div>
            <label className="text-sm font-medium">Arquivos</label>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="mt-2 block w-full text-sm"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Formato</label>
              <select
                className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              >
                {formatOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Qualidade</label>
              <select
                className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2"
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
              >
                {qualityOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            className="w-fit rounded-md bg-accent px-5 py-2 text-white shadow-soft disabled:opacity-60"
            onClick={onSubmit}
            disabled={files.length === 0 || isPending}
          >
            {isPending ? "Processando..." : "Compactar"}
          </button>
        </div>

        {results.length > 0 && (
          <div className="mt-10 grid gap-6">
            {results.map((r) => (
              <div key={r.name} className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-sm text-textMuted">
                      {Math.round(r.beforeSize / 1024)} KB → {Math.round(r.afterSize / 1024)} KB
                    </div>
                  </div>
                  <a
                    download={r.name.replace(/\.[^.]+$/, `.${r.format}`)}
                    href={r.dataUrl}
                    className="text-sm text-accent"
                  >
                    Baixar
                  </a>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-xs text-textMuted mb-2">Original</div>
                    {originals.get(r.name) && (
                      <img src={originals.get(r.name)} alt={r.name} className="w-full rounded-md" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-textMuted mb-2">Comprimida</div>
                    <img src={r.dataUrl} alt={r.name} className="w-full rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
