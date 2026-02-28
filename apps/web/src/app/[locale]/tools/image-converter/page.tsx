"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { convert, type ConvertResult } from "@/actions/convert";
import { zipSync, strToU8 } from "fflate";

const formatOptions = [
  { label: "JPEG", value: "jpeg" },
  { label: "PNG", value: "png" },
  { label: "WebP", value: "webp" },
  { label: "AVIF", value: "avif" },
] as const;

export default function ImageConverterPage() {
  const t = useTranslations("imageConverter");
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState("webp");
  const [results, setResults] = useState<ConvertResult[]>([]);
  const [isPending, startTransition] = useTransition();

  const originals = useMemo(() => {
    const map = new Map<string, string>();
    files.forEach((f) => map.set(f.name, URL.createObjectURL(f)));
    return map;
  }, [files]);

  const onSubmit = () => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.set("format", format);

    startTransition(async () => {
      const res = await convert(formData);
      setResults(res);
    });
  };

  const downloadZip = () => {
    const zipData: Record<string, Uint8Array> = {};
    for (const r of results) {
      const base64 = r.dataUrl.split(",")[1];
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const newName = r.name.replace(/\.[^.]+$/, `.${r.targetFormat}`);
      zipData[newName] = bytes;
    }
    const zipped = zipSync(zipData);
    const blob = new Blob([zipped.buffer as ArrayBuffer], { type: "application/zip" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted-images.zip";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-bg text-text">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-3xl font-display font-[500]">{t("heading")}</h1>
        <p className="mt-2 text-textMuted">{t("subtitle")}</p>

        <div className="mt-8 grid gap-6 rounded-lg border border-border bg-card p-6 shadow-soft">
          <div>
            <label className="text-sm font-medium">{t("files")}</label>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="mt-2 block w-full text-sm"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            />
          </div>

          <div>
            <label className="text-sm font-medium">{t("targetFormat")}</label>
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

          <button
            className="w-fit rounded-md bg-accent px-5 py-2 text-white shadow-soft disabled:opacity-60"
            onClick={onSubmit}
            disabled={files.length === 0 || isPending}
          >
            {isPending ? t("processing") : t("convert")}
          </button>
        </div>

        {results.length > 0 && (
          <div className="mt-10 grid gap-6">
            {results.length >= 2 && (
              <button
                className="w-fit rounded-md bg-accent px-5 py-2 text-white shadow-soft"
                onClick={downloadZip}
              >
                {t("downloadAll")}
              </button>
            )}
            {results.map((r) => (
              <div key={r.name} className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-sm text-textMuted">
                      {r.originalFormat.toUpperCase()} → {r.targetFormat.toUpperCase()} · {Math.round(r.beforeSize / 1024)} KB → {Math.round(r.afterSize / 1024)} KB
                    </div>
                  </div>
                  <a
                    download={r.name.replace(/\.[^.]+$/, `.${r.targetFormat}`)}
                    href={r.dataUrl}
                    className="text-sm text-accent"
                  >
                    {t("download")}
                  </a>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-xs text-textMuted mb-2">{t("original")}</div>
                    {originals.get(r.name) && (
                      <img src={originals.get(r.name)} alt={r.name} className="w-full rounded-md" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-textMuted mb-2">{t("converted")}</div>
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
