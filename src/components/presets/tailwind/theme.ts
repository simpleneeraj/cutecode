import { Theme, IconType } from "@/typings/editor";
import { convertToShikiTheme } from "../themes/shared";

export const tailwind: Theme = {
  id: "tailwind",
  name: "Tailwind",
  background: {
    from: "#36B6F0",
    to: "#36B6F0",
  },
  icon: { type: IconType.IMAGE, source: "/editor/assets/tailwind/logo.svg" },
  partner: true,
  group: "Brands",
  lineNumbers: true,
  font: "fira-code",
  syntax: {
    light: convertToShikiTheme({
      foreground: "#000",
      highlightBorder: "#0484C7",
      highlight: "rgba(25,147,211,0.10)",
      highlightHover: "rgba(25,147,211,0.06)",
    }),
    dark: convertToShikiTheme({
      foreground: "#fff",
      highlightBorder: "#C1B2F9",
      highlight: "rgba(193,178,249,0.12)",
      highlightHover: "rgba(193,178,249,0.07)",
    }),
  },
};
