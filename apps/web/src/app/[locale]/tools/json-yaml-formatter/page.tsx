"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  detectFormat,
  prettifyJson,
  minifyJson,
  validateJson,
  jsonToYaml,
  yamlToJson,
  prettifyYaml,
  validateYaml,
  type FormatType,
  type ValidationResult,
} from "@/lib/format-utils";

export default function JsonYamlFormatterPage() {
  const t = useTranslations("jsonYaml");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [detectedFormat, setDetectedFormat] = useState<FormatType | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [copied, setCopied] = useState(false);

  const detect = useCallback((value: string) => {
    const fmt = detectFormat(value);
    setDetectedFormat(fmt);
    setValidation(null);
    return fmt;
  }, []);

  const onInputChange = (value: string) => {
    setInput(value);
    detect(value);
    setOutput("");
    setValidation(null);
  };

  const handleFormat = () => {
    const fmt = detectedFormat ?? detect(input);
    if (!fmt) return;
    try {
      if (fmt === "json") setOutput(prettifyJson(input));
      else setOutput(prettifyYaml(input));
    } catch {
      // ignore
    }
  };

  const handleMinify = () => {
    const fmt = detectedFormat ?? detect(input);
    if (fmt !== "json") return;
    try {
      setOutput(minifyJson(input));
    } catch {
      // ignore
    }
  };

  const handleValidate = () => {
    const fmt = detectedFormat ?? detect(input);
    if (!fmt) return;
    const result = fmt === "json" ? validateJson(input) : validateYaml(input);
    setValidation(result);
  };

  const handleConvert = () => {
    const fmt = detectedFormat ?? detect(input);
    if (!fmt) return;
    try {
      if (fmt === "json") {
        setOutput(jsonToYaml(input));
        setDetectedFormat("yaml");
      } else {
        setOutput(yamlToJson(input));
        setDetectedFormat("json");
      }
    } catch {
      // ignore
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setDetectedFormat(null);
    setValidation(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      setInput(text);
      detect(text);
      setOutput("");
      setValidation(null);
    };
    reader.readAsText(file);
  };

  const targetFormat = detectedFormat === "json" ? "YAML" : "JSON";

  return (
    <main className="min-h-screen bg-bg text-text">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-3xl font-display font-[500]">{t("heading")}</h1>
        <p className="mt-2 text-textMuted">{t("subtitle")}</p>

        {/* Action bar */}
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <button
            onClick={handleFormat}
            disabled={!detectedFormat}
            className="rounded-md bg-accent px-4 py-2 text-sm text-white shadow-soft disabled:opacity-60"
          >
            {t("format")}
          </button>
          <button
            onClick={handleMinify}
            disabled={detectedFormat !== "json"}
            className="rounded-md border border-border bg-white px-4 py-2 text-sm disabled:opacity-60"
          >
            {t("minify")}
          </button>
          <button
            onClick={handleValidate}
            disabled={!detectedFormat}
            className="rounded-md border border-border bg-white px-4 py-2 text-sm disabled:opacity-60"
          >
            {t("validate")}
          </button>
          <button
            onClick={handleConvert}
            disabled={!detectedFormat}
            className="rounded-md border border-border bg-white px-4 py-2 text-sm disabled:opacity-60"
          >
            {t("convert", { target: targetFormat })}
          </button>
          <label className="cursor-pointer rounded-md border border-border bg-white px-4 py-2 text-sm">
            {t("uploadFile")}
            <input
              type="file"
              accept=".json,.yaml,.yml"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
          <button
            onClick={handleClear}
            className="rounded-md border border-border bg-white px-4 py-2 text-sm"
          >
            {t("clear")}
          </button>
          {detectedFormat && (
            <span className="ml-auto text-xs text-textMuted">
              {t("autoDetected", { format: detectedFormat.toUpperCase() })}
            </span>
          )}
        </div>

        {/* Validation banner */}
        {validation && (
          <div
            className={`mt-4 rounded-md px-4 py-2 text-sm ${
              validation.valid
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {validation.valid
              ? t("valid")
              : validation.line
                ? t("errorAtLine", { line: validation.line, message: validation.error ?? "" })
                : validation.error}
          </div>
        )}

        {/* Two-panel layout */}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">{t("input")}</label>
            <textarea
              className="mt-2 h-96 w-full resize-none rounded-lg border border-border bg-white p-4 font-mono text-sm"
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder='{ "key": "value" }'
              spellCheck={false}
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t("output")}</label>
              {output && (
                <button onClick={handleCopy} className="text-xs text-accent">
                  {copied ? t("copied") : t("copy")}
                </button>
              )}
            </div>
            <textarea
              className="mt-2 h-96 w-full resize-none rounded-lg border border-border bg-white p-4 font-mono text-sm"
              value={output}
              readOnly
              spellCheck={false}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
