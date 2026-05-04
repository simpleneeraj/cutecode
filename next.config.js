const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const withMDX = require("@next/mdx")();

/** @type {import('next').NextConfig} */

const nextConfig = {
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  reactStrictMode: true,
  transpilePackages: ["highlight.js"],
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg", "shiki"],
};

module.exports = withBundleAnalyzer(withMDX(nextConfig));
