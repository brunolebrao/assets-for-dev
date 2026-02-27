import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations();

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#0B0F14]">
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="font-[500] text-4xl md:text-5xl tracking-tight">
          {t("home.title")}
        </h1>
        <p className="mt-4 text-lg text-[#1C2430]">
          {t("home.subtitle")}
        </p>
        <a
          href="/tools/image-compressor"
          className="mt-8 inline-flex items-center rounded-xl bg-[#2F6BFF] px-5 py-3 text-white shadow-[0_8px_24px_rgba(15,23,42,.08)]"
        >
          {t("home.cta")}
        </a>
      </section>
    </main>
  );
}
