"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";

export default function QrCodeGeneratorPage() {
  const t = useTranslations("qrCode");
  const [text, setText] = useState("");
  const [size, setSize] = useState(256);
  const [errorCorrection, setErrorCorrection] = useState<"L" | "M" | "Q" | "H">("M");
  const [foreground, setForeground] = useState("#000000");
  const [background, setBackground] = useState("#FFFFFF");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [svgString, setSvgString] = useState<string | null>(null);
  const qrCodeRef = useRef<typeof import("qrcode") | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    import("qrcode").then((mod) => {
      qrCodeRef.current = mod.default ?? mod;
    });
  }, []);

  const generate = useCallback(async (value: string) => {
    const QRCode = qrCodeRef.current;
    if (!QRCode || !value.trim()) {
      setDataUrl(null);
      setSvgString(null);
      return;
    }

    const options = {
      width: size,
      errorCorrectionLevel: errorCorrection,
      color: { dark: foreground, light: background },
      margin: 2,
    };

    try {
      const [png, svg] = await Promise.all([
        QRCode.toDataURL(value, options),
        QRCode.toString(value, { ...options, type: "svg" }),
      ]);
      setDataUrl(png);
      setSvgString(svg);
    } catch {
      setDataUrl(null);
      setSvgString(null);
    }
  }, [size, errorCorrection, foreground, background]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => generate(text), 300);
    return () => clearTimeout(debounceRef.current);
  }, [text, generate]);

  const downloadPng = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "qrcode.png";
    a.click();
  };

  const downloadSvg = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcode.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-bg text-text">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-3xl font-display font-[500]">{t("heading")}</h1>
        <p className="mt-2 text-textMuted">{t("subtitle")}</p>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          {/* Controls */}
          <div className="grid gap-5 rounded-lg border border-border bg-card p-6 shadow-soft self-start">
            <div>
              <label className="text-sm font-medium">{t("textLabel")}</label>
              <input
                type="text"
                className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                placeholder={t("textPlaceholder")}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                {t("size")} — {size}px
              </label>
              <input
                type="range"
                min={128}
                max={1024}
                step={8}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="mt-2 w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium">{t("errorCorrection")}</label>
              <select
                className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2"
                value={errorCorrection}
                onChange={(e) => setErrorCorrection(e.target.value as "L" | "M" | "Q" | "H")}
              >
                <option value="L">L (7%)</option>
                <option value="M">M (15%)</option>
                <option value="Q">Q (25%)</option>
                <option value="H">H (30%)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t("foreground")}</label>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="color"
                    value={foreground}
                    onChange={(e) => setForeground(e.target.value)}
                    className="h-9 w-9 cursor-pointer rounded border border-border"
                  />
                  <input
                    type="text"
                    value={foreground}
                    onChange={(e) => setForeground(e.target.value)}
                    className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">{t("background")}</label>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="color"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="h-9 w-9 cursor-pointer rounded border border-border"
                  />
                  <input
                    type="text"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={downloadPng}
                disabled={!dataUrl}
                className="rounded-md bg-accent px-5 py-2 text-white shadow-soft disabled:opacity-60"
              >
                {t("downloadPng")}
              </button>
              <button
                onClick={downloadSvg}
                disabled={!svgString}
                className="rounded-md border border-border bg-white px-5 py-2 disabled:opacity-60"
              >
                {t("downloadSvg")}
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-start justify-center rounded-lg border border-border bg-card p-6 shadow-soft">
            {dataUrl ? (
              <img src={dataUrl} alt="QR Code" className="rounded-md" style={{ maxWidth: "100%" }} />
            ) : (
              <div className="flex h-64 w-64 items-center justify-center rounded-md border border-dashed border-border text-sm text-textMuted">
                {t("preview")}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
