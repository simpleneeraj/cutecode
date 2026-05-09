import { Theme, IconType } from "@/typings/editor";
import { convertToShikiTheme } from "../themes/shared";

export const stripe: Theme = {
  id: "stripe",
  name: "Stripe",
  background: {
    from: "#0a2540",
    to: "#0a2540",
  },
  icon: { type: IconType.IMAGE, source: "/editor/assets/stripe/logo.svg" },
  partner: true,
  group: "Brands",
  font: "source-code-pro",
  lineNumbers: true,
  syntax: {
    dark: convertToShikiTheme({
      foreground: "#FFFFFF",
      constant: "#FFFFFF",
      string: "#ffa956",
      comment: "#a9bcce",
      keyword: "#8095ff",
      parameter: "#FF6B35",
      function: "#00d4ff",
      stringExpression: "#ffa956",
      punctuation: "#FFFFFF",
      link: "#ffa956",
      number: "#ffa956",
      property: "#1abdc0",
      objectLiteral: "#1abdc0",
      highlight: "rgba(255, 107, 53, 0.15)",
      highlightBorder: "#FF6B35",
      highlightHover: "rgba(255, 107, 53, 0.08)",
      diffInserted: "#34D399",
      diffDeleted: "#F87171",
    }),
  },
};
