import type { NextConfig } from "next";

const withNextIntl = require("next-intl/plugin")("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp"],
};

export default withNextIntl(nextConfig);
