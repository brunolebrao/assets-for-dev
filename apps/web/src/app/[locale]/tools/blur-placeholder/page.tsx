"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { generatePlaceholders, type PlaceholderResult } from "@/actions/blur-placeholder";

type TabKey = "blurDataUrl" | "cssShimmer" | "tinyImage";

export default function BlurPlaceholderPage() {
  const t = useTranslations("blurPlaceholder");
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<PlaceholderResult[]>([]);
  const [isPending, startTransition] = useTransition();
  const [activeTabs, setActiveTabs] = useState<Record<string, TabKey>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const onSubmit = () => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    startTransition(async () => {
      const res = await generatePlaceholders(formData);
      setResults(res);
      const tabs: Record<string, TabKey> = {};
      res.forEach((r) => (tabs[r.name] = "blurDataUrl"));
      setActiveTabs(tabs);
    });
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getSnippet = (result: PlaceholderResult, tab: TabKey) => {
    if (tab === "blurDataUrl") return result.codeSnippets.nextImage;
    if (tab === "cssShimmer") return result.codeSnippets.cssBackground;
    return result.codeSnippets.imgSrc;
  };

  const getPreview = (result: PlaceholderResult, tab: TabKey) => {
    if (tab === "blurDataUrl") return result.placeholders.blurDataUrl;
    if (tab === "tinyImage") return result.placeholders.tinyImage;
    return null;
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: "blurDataUrl", label: t("blurDataUrl") },
    { key: "cssShimmer", label: t("cssShimmer") },
    { key: "tinyImage", label: t("tinyImage") },
  ];

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

          <button
            className="w-fit rounded-md bg-accent px-5 py-2 text-white shadow-soft disabled:opacity-60"
            onClick={onSubmit}
            disabled={files.length === 0 || isPending}
          >
            {isPending ? t("processing") : t("generate")}
          </button>
        </div>

        {results.length > 0 && (
          <div className="mt-10 grid gap-6">
            {results.map((r) => {
              const activeTab = activeTabs[r.name] ?? "blurDataUrl";
              const preview = getPreview(r, activeTab);
              const snippet = getSnippet(r, activeTab);
              const copyKey = `${r.name}-${activeTab}`;

              return (
                <div key={r.name} className="rounded-lg border border-border bg-card p-5">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-sm text-textMuted">
                    {r.originalWidth} × {r.originalHeight}
                  </div>

                  <div className="mt-4 flex gap-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTabs((prev) => ({ ...prev, [r.name]: tab.key }))}
                        className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                          activeTab === tab.key
                            ? "bg-accent text-white"
                            : "bg-white border border-border text-text hover:bg-accentSoft"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="text-xs text-textMuted mb-2">{t("preview")}</div>
                      {preview ? (
                        <img
                          src={preview}
                          alt="placeholder preview"
                          className="w-full rounded-md border border-border"
                          style={{ imageRendering: "pixelated" }}
                        />
                      ) : (
                        <div
                          className="w-full aspect-video rounded-md border border-border"
                          style={{
                            background: r.placeholders.cssShimmer,
                            backgroundSize: "200% 200%",
                            animation: "shimmer 1.5s ease-in-out infinite",
                          }}
                        />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-textMuted">{t("codeSnippet")}</div>
                        <button
                          onClick={() => copyToClipboard(snippet, copyKey)}
                          className="text-xs text-accent"
                        >
                          {copiedKey === copyKey ? t("copied") : t("copy")}
                        </button>
                      </div>
                      <pre className="overflow-auto rounded-md bg-white border border-border p-3 text-xs leading-relaxed">
                        <code>{snippet}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
