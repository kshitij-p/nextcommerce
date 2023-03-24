// @ts-check

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env.mjs"));

import NextBundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: process.env.ANALYZE === 'true'
})

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  /**
   * If you have the "experimental: { appDir: true }" setting enabled, then you
   * must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        port: ""
      },
    ],
  },
  //Note: when permanent redirects are changed, cache has to be cleared (permanent redirects are cached by browsers) 
  redirects: async () => ([{ source: "/login", destination: "/signin", permanent: true, }, { source: "/logout", destination: "/signout", permanent: true }])
};
export default withBundleAnalyzer(config);
