import { Theme } from "@/typings/editor";
import { convertToShikiTheme } from "../shared";

export const sunset: Theme = {
  id: "sunset",
  name: "Sunset",
  background: {
    from: "#FFCF73",
    to: "#FF7A2F",
  },
  group: "Defaults",
  syntax: {
    light: convertToShikiTheme({
      foreground: "#737568",
      constant: "#AD5A78",
      string: "#8C703C",
      comment: "#7A7055",
      keyword: "#A1642C",
      parameter: "#807410",
      function: "#807410",
      stringExpression: "#8C703C",
      punctuation: "#A1642C",
      link: "#A1642C",
      number: "#856F00",
      property: "#AD5A78",
      diffInserted: "#856F00",
      diffDeleted: "#AD5A78",
    }),
    dark: convertToShikiTheme({
      foreground: "#FFFFFF",
      constant: "#E978A1",
      string: "#F9D38C",
      comment: "#878572",
      keyword: "#FFAF65",
      parameter: "#E2D66B",
      function: "#E2D66B",
      stringExpression: "#F9D38C",
      punctuation: "#FFAF65",
      link: "#FFAF65",
      number: "#E7CF55",
      property: "#E978A1",
      diffInserted: "#E7CF55",
      diffDeleted: "#E978A1",
    }),
  },
};
