import createMiddleware from "next-intl/middleware";
import { defaultLocale, locales } from "./src/i18n/routing";

export default createMiddleware({
  locales,
  defaultLocale
});

export const config = {
  matcher: ["/", "/(pt-BR|en)/:path*"],
};
