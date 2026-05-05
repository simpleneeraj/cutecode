import { Theme } from "@/typings/editor";
import { convertToShikiTheme } from "../shared";

export const meadow: Theme = {
  id: "meadow",
  name: "Meadow",
  background: {
    from: "#59D499",
    to: "#A0872D",
  },
  group: "Defaults",
  syntax: {
    light: convertToShikiTheme({
      foreground: "#54594D",
      constant: "#B6781B",
      string: "#837E50",
      comment: "#72806E",
      keyword: "#049649",
      parameter: "#798B52",
      function: "#798B52",
      stringExpression: "#837E50",
      punctuation: "#049649",
      link: "#049649",
      number: "#2C8801",
      property: "#B6781B",
      diffInserted: "#049649",
      diffDeleted: "#B6781B",
    }),
    dark: convertToShikiTheme({
      foreground: "#FFFFFF",
      constant: "#E4B165",
      string: "#E9EB9D",
      comment: "#708B6C",
      keyword: "#6DD79F",
      parameter: "#B3D767",
      function: "#B3D767",
      stringExpression: "#E9EB9D",
      punctuation: "#6DD79F",
      link: "#6DD79F",
      number: "#46B114",
      property: "#E4B165",
      diffInserted: "#B3D767",
      diffDeleted: "#E4B165",
    }),
  },
};
