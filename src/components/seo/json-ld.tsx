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
      "CuteCode is a free online code screenshot tool. Create beautiful, export-ready images of your code with custom themes, fonts, and backgrounds — no sign-up required.",
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
        name: "Free",
        description: "10 exports/month with basic themes",
      },
      {
        "@type": "Offer",
        price: "9",
        priceCurrency: "USD",
        name: "Pro",
        description: "Unlimited HD exports, premium themes, watermark removal",
      },
    ],
    featureList: [
      "Beautiful code screenshots",
      "Syntax highlighting for 100+ languages",
      "Custom themes and fonts",
      "Export as PNG, SVG, or clipboard",
      "Share code snippets via URL",
      "Dark and light mode support",
    ],
    screenshot: "https://www.cutecode.app/og-image.png",
    author: {
      "@type": "Organization",
      name: "CuteCode",
      url: "https://www.cutecode.app",
    },
    sameAs: ["https://twitter.com/cutecode"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
