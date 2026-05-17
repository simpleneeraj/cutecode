/**
 * JSON-LD Structured Data — WebApplication Schema
 * Drop this into your root layout or any page as a Server Component.
 * Helps Google understand what CuteCode does and surfaces rich results.
 */
export default function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "CuteCode",
    url: "https://www.cutecode.app",
    description:
      "Create beautiful code screenshots in seconds. Pick a theme, export HD images, share instantly. Best alternative to ray.so and Carbon for developers.",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "All",
    browserRequirements: "Requires JavaScript",
    inLanguage: "en",
    isAccessibleForFree: true,
    offers: [
      {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        name: "Free Plan",
        description: "Get started for free with core code screenshot features. No credit card required.",
      },
      {
        "@type": "Offer",
        price: "5",
        priceCurrency: "USD",
        name: "Pro Plan",
        description: "Unlimited HD exports, premium themes, custom fonts, and watermark-free images.",
      },
    ],
    featureList: [
      "Beautiful code screenshots",
      "Syntax highlighting for 100+ languages",
      "Custom themes and fonts",
      "Export as PNG or copy to clipboard",
      "Share code snippets via URL",
      "Dark and light mode support",
      "Embed snippets anywhere",
    ],
    screenshot: "https://www.cutecode.app/og-image.png",
    author: {
      "@type": "Organization",
      name: "CuteCode",
      url: "https://www.cutecode.app",
    },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
