import { BadgeVariant, IconType, Theme } from "@/typings/editor";
import { convertToShikiTheme } from "../themes/shared";

export const ps6: Theme = {
  id: "ps6",
  name: "PS6",
  background: {
    from: "#0e0e18",
    to: "#13131f",
  },
  icon: {
    type: IconType.ICONIFY,
    source: "simple-icons:playstation",
  },
  tags: [BadgeVariant.NEW, BadgeVariant.PREMIUM],
  group: "Gaming",
  font: "fira-code",
  syntax: {
    light: convertToShikiTheme({
      foreground: "#1a1a3a",
      constant: "#208060", // triangle teal
      string: "#906020", // square amber
      comment: "#9098c0",
      keyword: "#4050a0", // cross blue-violet
      parameter: "#208060",
      function: "#a03050", // circle pink-red
      stringExpression: "#906020",
      punctuation: "#8090c0",
      link: "#a03050",
      number: "#208060",
      property: "#4050a0",
      highlight: "rgba(120, 152, 240, 0.1)",
      highlightBorder: "#7898f0",
      highlightHover: "rgba(120, 152, 240, 0.05)",
      diffInserted: "#208060",
      diffDeleted: "#a03050",
    }),
    dark: convertToShikiTheme({
      foreground: "#c8d0f8",
      constant: "#78e8b8", // triangle teal
      string: "#f0a030", // square amber
      comment: "#30305a",
      keyword: "#7898f0", // cross blue-violet
      parameter: "#78e8b8",
      function: "#f07898", // circle pink-red
      stringExpression: "#f0a030",
      punctuation: "#40406a",
      link: "#f07898",
      number: "#78e8b8",
      property: "#7898f0",
      highlight: "rgba(120, 152, 240, 0.12)",
      highlightBorder: "#7898f0",
      highlightHover: "rgba(120, 152, 240, 0.06)",
      diffInserted: "#78e8b8",
      diffDeleted: "#f07898",
    }),
  },
};
