import { cn } from "@/utils/cn";
import localFont from "next/font/local";
import { Kablammo, Nothing_You_Could_Do, Delius, Cabin_Sketch, Fraunces } from "next/font/google";

/* ------------------------------- */
/* App Fonts                       */
/* ------------------------------- */

const fontSans = localFont({
  display: "swap",
  src: "./CalSansUI[MODE,wght].woff2",
  variable: "--font-sans",
});

// Heading: Fraunces — premium variable serif with optical sizing. Real weights,
// so heading `font-semibold`/`font-bold` stay crisp (no faux-bold).
const fontHeading = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  axes: ["opsz"],
});

const kablammo = Kablammo({ subsets: ["latin"], weight: "variable", variable: "--kablammo" });

const nothingYouCouldDo = Nothing_You_Could_Do({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--nothing-you-could-do",
});
const delius = Delius({ weight: ["400"], subsets: ["latin"], variable: "--delius" });
const cabinSketch = Cabin_Sketch({ weight: ["400", "700"], subsets: ["latin"], variable: "--cabin-sketch" });

// Applied at the root layout so portaled overlays (dialog/sheet titles) inherit the heading font.
export const headingFontVariable = fontHeading.variable;

export default cn(
  kablammo.variable,
  nothingYouCouldDo.variable,
  delius.variable,
  cabinSketch.variable,
  fontSans.variable,
  fontHeading.variable,
);
