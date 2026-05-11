import {
  BACKGROUND_TYPE,
  EditorState,
  ELEMENTS,
  ElementType,
  HeaderInputType,
  HeaderVariants,
  InitialValues,
} from "@/typings/editor";

export const MIN_SLIDE_WIDTH = 520;
export const MAX_SLIDE_WIDTH = 920;

export const createDefaultElement = (): ElementType => ({
  id: crypto.randomUUID().toString(),

  type: ELEMENTS.CODE,

  content:
    "import SwiftUI\n\nstruct CircleImage: View {\n  var body: some View {\n    Image('turtlerock')\n      .clipShape(Circle())\n  }\n}",

  style: {
    fontSize: 14,
    fontWeight: 400,
    fontFamily: "DM Mono",
    background: "rgba(0, 0, 0, 0.5)",
    padding: "32px",
  },

  properties: {
    theme: "clerk",
    language: "Swift",
    transparent: true,
    darkMode: true,
    showLineNumbers: true,
    highlightedLines: [],
    glassmorphism: { opacity: 0, enabled: true, blur: 16 },
  },

  header: {
    type: "terminal",
    variant: HeaderVariants.OUTLINE,
    input: HeaderInputType.ICON,
    position: "left",
    style: { background: "rgba(0, 0, 0, 0.75)" },
    properties: {
      colors: [
        { name: "Red", hex: "#fd4539" },
        { name: "Yellow", hex: "#ffd213" },
        { name: "Green", hex: "#21d854" },
      ],
      title: {
        text: "CuteCode.swift",
        icon: "https://raw.githubusercontent.com/simpleneeraj/vscode-material-icon-theme/main/icons/swift.svg",
      },
    },
  },

  watermark: {
    text: "Code",
    image: "",
    style: { opacity: 0.3, fontSize: "12px", color: "#ffffff" },
  },
});

const seedElement = createDefaultElement();
seedElement.id = InitialValues.ELEMENT_ID;

const initialState: EditorState = {
  slides: {
    [InitialValues.SLIDE_ID]: {
      id: InitialValues.SLIDE_ID,
      name: "Crystal Slide",
      background: {
        type: BACKGROUND_TYPE.GRADIENT,
        style: { width: 450, height: 450, size: "cover", position: "center", repeat: "no-repeat", aspectRatio: "1:1" },
        properties: {
          image: "https://cdn.pixabay.com/photo/2022/01/28/18/32/leaves-6975462_1280.png",
          gradient: "",
        },
      },
    },
  },
  elements: { [InitialValues.ELEMENT_ID]: seedElement },
  slideElements: { [InitialValues.SLIDE_ID]: [InitialValues.ELEMENT_ID] },
};
export default initialState;
