import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

const tools = [
  { key: "imageCompressor", href: "/tools/image-compressor", icon: "📦" },
  { key: "imageConverter", href: "/tools/image-converter", icon: "🔄" },
  { key: "blurPlaceholder", href: "/tools/blur-placeholder", icon: "🖼" },
  { key: "jsonYaml", href: "/tools/json-yaml-formatter", icon: "{ }" },
  { key: "qrCode", href: "/tools/qr-code-generator", icon: "▣" },
] as const;

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <main className="min-h-screen bg-bg text-text">
      <section className="mx-auto max-w-5xl px-6 py-20">
        <h1 className="font-display font-[500] text-4xl md:text-5xl tracking-tight">
          {t("home.title")}
        </h1>
        <p className="mt-4 text-lg text-textMuted">
          {t("home.subtitle")}
        </p>

        <h2 className="mt-14 text-xl font-display font-[500]">
          {t("home.toolsHeading")}
        </h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.key}
              href={`/${locale}${tool.href}`}
              className="group rounded-lg border border-border bg-card p-6 shadow-soft transition-shadow hover:shadow-md"
            >
              <span className="text-2xl" aria-hidden="true">{tool.icon}</span>
              <h3 className="mt-3 font-display font-[500] text-lg group-hover:text-accent transition-colors">
                {t(`tools.${tool.key}.title`)}
              </h3>
              <p className="mt-1 text-sm text-textMuted">
                {t(`tools.${tool.key}.description`)}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
