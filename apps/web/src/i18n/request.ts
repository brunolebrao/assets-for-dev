import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  const normalized = locales.includes(locale as any) ? locale : defaultLocale;
  return {
    locale: normalized,
    messages: (await import(`../messages/${normalized}.json`)).default,
  };
});
