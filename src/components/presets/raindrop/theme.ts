import { Theme } from "@/typings/editor";
import { convertToShikiTheme } from "../shared";

export const raindrop: Theme = {
  id: "raindrop",
  name: "Raindrop",
  background: {
    from: "#8EC7FB",
    to: "#1C55AA",
  },
  group: "Defaults",
  syntax: {
    light: convertToShikiTheme({
      foreground: "#687077",
      constant: "#007BA1",
      string: "#507683",
      comment: "#6E7780",
      keyword: "#008DAC",
      parameter: "#4F9488",
      function: "#4F9488",
      stringExpression: "#507683",
      punctuation: "#008DAC",
      link: "#008DAC",
      number: "#7459E1",
      property: "#007BA1",
      diffInserted: "#008DAC",
      diffDeleted: "#7459E1",
    }),
    dark: convertToShikiTheme({
      foreground: "#E4F2FF",
      constant: "#008BB7",
      string: "#9DD8EB",
      comment: "#6C808B",
      keyword: "#2ED9FF",
      parameter: "#1AD6B5",
      function: "#1AD6B5",
      stringExpression: "#9DD8EB",
      punctuation: "#2ED9FF",
      link: "#2ED9FF",
      number: "#9984EE",
      property: "#008BB7",
      diffInserted: "#2ED9FF",
      diffDeleted: "#9984EE",
    }),
  },
};
