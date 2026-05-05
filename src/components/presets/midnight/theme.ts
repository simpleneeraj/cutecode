import { Theme } from "@/typings/editor";
import { convertToShikiTheme } from "../shared";

export const midnight: Theme = {
  id: "midnight",
  name: "Midnight",
  background: {
    from: "#4CC8C8",
    to: "#202033",
  },
  group: "Defaults",
  syntax: {
    light: convertToShikiTheme({
      foreground: "#434447",
      constant: "#766599",
      string: "#5F758F",
      comment: "#78808C",
      keyword: "#587678",
      parameter: "#2F788F",
      function: "#2F788F",
      stringExpression: "#5F758F",
      punctuation: "#587678",
      link: "#5A797A",
      number: "#2D8264",
      property: "#766599",
      diffInserted: "#2D8264",
      diffDeleted: "#766599",
    }),
    dark: convertToShikiTheme({
      foreground: "#FFFFFF",
      constant: "#9681C2",
      string: "#6D86A4",
      comment: "#4A4C56",
      keyword: "#7DA9AB",
      parameter: "#51D0F8",
      function: "#51D0F8",
      stringExpression: "#6D86A4",
      punctuation: "#7DA9AB",
      link: "#7DA9AB",
      number: "#75D2B1",
      property: "#9681C2",
      diffInserted: "#75D2B1",
      diffDeleted: "#9681C2",
    }),
  },
};
