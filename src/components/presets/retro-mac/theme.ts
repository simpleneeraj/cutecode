import { Theme, IconType, BadgeVariant } from "@/typings/editor";
import { convertToShikiTheme } from "../themes/shared";

export const retroMac: Theme = {
  id: "retro-mac",
  name: "Retro Mac",
  background: {
    from: "#2C2117",
    to: "#15100B",
  },
  group: "Aesthetic",
  icon: {
    type: IconType.ICONIFY,
    source: "emojione-v1:old-personal-computer",
  },
  tags: [BadgeVariant.PREMIUM],
  font: "fira-code",
  syntax: {
    light: convertToShikiTheme({
      foreground: "#3D2810",
      constant: "#B56A2E",
      string: "#C0784A",
      comment: "#9A845E",
      keyword: "#C05C78",
      parameter: "#7A5030",
      function: "#8B5C2E",
      stringExpression: "#C0784A",
      punctuation: "#5C3820",
      link: "#B56A2E",
      number: "#A0622A",
      property: "#8A5428",
      highlight: "rgba(160, 100, 50, 0.12)",
      highlightBorder: "#C09060",
      highlightHover: "rgba(160, 100, 50, 0.06)",
      diffInserted: "#5A8C50",
      diffDeleted: "#A04040",
    }),
    // Dark = deeper moody brown
    dark: convertToShikiTheme({
      foreground: "#D4AE80",
      constant: "#E8A84C",
      string: "#DDA070",
      comment: "#8A7458",
      keyword: "#E87090",
      parameter: "#C08848",
      function: "#D09050",
      stringExpression: "#DDA070",
      punctuation: "#B89060",
      link: "#E8A84C",
      number: "#D49448",
      property: "#E8A84C",
      highlight: "rgba(220, 174, 120, 0.10)",
      highlightBorder: "#C09060",
      highlightHover: "rgba(220, 174, 120, 0.06)",
      diffInserted: "#70A870",
      diffDeleted: "#C06060",
    }),
  },
};
