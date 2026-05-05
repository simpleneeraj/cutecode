import { Theme } from "@/typings/editor";
import { convertToShikiTheme } from "../shared";

export const candy: Theme = {
  id: "candy",
  name: "Candy",
  background: {
    from: "#A58EFB",
    to: "#E9BFF8",
  },
  group: "Defaults",
  syntax: {
    light: convertToShikiTheme({
      foreground: "#434447",
      constant: "#2286A6",
      string: "#B2762E",
      comment: "#8D949B",
      keyword: "#DC155E",
      parameter: "#009033",
      function: "#009033",
      stringExpression: "#B2762E",
      punctuation: "#d15a8b",
      link: "#d15a8b",
      number: "#676DFF",
      property: "#2286A6",
      diffInserted: "#009033",
      diffDeleted: "#FF605E",
    }),
    dark: convertToShikiTheme({
      foreground: "#FFFFFF",
      constant: "#1AC8FF",
      string: "#DFD473",
      comment: "#807796",
      keyword: "#FF659C",
      parameter: "#1AC8FF",
      function: "#73DFA5",
      stringExpression: "#DFD473",
      punctuation: "#FF659C",
      link: "#FF659C",
      number: "#7A7FFD",
      property: "#1AC8FF",
      diffInserted: "#73DFA5",
      diffDeleted: "#FF605E",
    }),
  },
};
