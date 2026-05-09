import { Theme } from "@/typings/editor";
import { convertToShikiTheme } from "../themes/shared";

export const macosTerminal: Theme = {
  id: "macos-terminal",
  name: "macOS Terminal",
  background: {
    from: "#1a1a2a",
    to: "#1e1e2e",
  },
  group: "System",
  font: "sf-mono",
  syntax: {
    light: convertToShikiTheme({
      foreground: "#1a1a2a",
      constant: "#1a5fb4",
      string: "#1a8a30",
      comment: "#9090a8",
      keyword: "#6030a0",
      parameter: "#905010",
      function: "#1a5fb4",
      stringExpression: "#1a8a30",
      punctuation: "#9090a8",
      link: "#1a5fb4",
      number: "#905010",
      property: "#6030a0",
      highlight: "rgba(48, 168, 255, 0.1)",
      highlightBorder: "#30a8ff",
      highlightHover: "rgba(48, 168, 255, 0.05)",
      diffInserted: "#1a8a30",
      diffDeleted: "#c0143c",
    }),
    dark: convertToShikiTheme({
      foreground: "#d0d0e8",
      constant: "#bf8dff", // purple  — constants
      string: "#30d158", // green   — strings (macOS green accent)
      comment: "#40405a", // muted
      keyword: "#ff9f0a", // amber   — keywords
      parameter: "#30a8ff", // blue    — params
      function: "#30d158", // green   — functions
      stringExpression: "#30d158",
      punctuation: "#40405a",
      link: "#30a8ff",
      number: "#ff9f0a",
      property: "#bf8dff",
      highlight: "rgba(48, 209, 88, 0.1)",
      highlightBorder: "#30d158",
      highlightHover: "rgba(48, 209, 88, 0.05)",
      diffInserted: "#30d158",
      diffDeleted: "#ff453a",
    }),
  },
};
