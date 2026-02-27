import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <main className="min-h-screen bg-bg text-text">
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="font-display font-[500] text-4xl md:text-5xl tracking-tight">
          {t("home.title")}
        </h1>
        <p className="mt-4 text-lg text-textMuted">
          {t("home.subtitle")}
        </p>
        <Link
          href={`/${locale}/tools/image-compressor`}
          className="mt-8 inline-flex items-center rounded-xl bg-accent px-5 py-3 text-white shadow-soft"
        >
          {t("home.cta")}
        </Link>
      </section>
    </main>
  );
}
