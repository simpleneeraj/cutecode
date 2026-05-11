import { cn } from "@/utils/cn";
import localFont from "next/font/local";
import { Geist_Mono, Space_Mono, DM_Mono, Google_Sans_Code } from "next/font/google";

/* ------------------------------- */
/* Fonts (MUST be top-level const) */
/* ------------------------------- */

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-geist-mono",
});

const googleSansCode = Google_Sans_Code({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-google-sans-code",
  adjustFontFallback: false,
  fallback: ["monospace", "sans-serif"],
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-space-mono",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-dm-mono",
});

const commitMono = localFont({
  src: "./commit-mono-regular.woff2",
  variable: "--font-commitmono",
  display: "swap",
});

// const soehneMono = localFont({
//   src: "./soehne-mono-buch.woff2",
//   variable: "--font-soehne-mono",
//   display: "swap",
// });

const cascadiaCode = localFont({
  src: "./cascadia-code/cascadia-code.woff2",
  variable: "--font-cascadia-code",
  display: "swap",
});

const comicMono = localFont({
  src: "./comic-mono/comic-mono.ttf",
  variable: "--font-comic-mono",
  display: "swap",
});

const droidSansMono = localFont({
  src: "./ligaturized/droid-sans-mono.ttf",
  variable: "--font-droid-sans-mono",
  display: "swap",
});

const fantasqueSansMono = localFont({
  src: "./ligaturized/fantasque-sans-mono.ttf",
  variable: "--font-fantasque-sans-mono",
  display: "swap",
});

const firaCode = localFont({
  src: "./fira-code/fira-code-regular.woff2",
  variable: "--font-fira-code-regular",
  display: "swap",
});

const hachiMaruPop = localFont({
  src: "./hachi-maru-pop/hachi-maru-pop.woff",
  variable: "--font-hachi-maru-pop",
  display: "swap",
});

const hack = localFont({
  src: "./ligaturized/hack.ttf",
  variable: "--font-hack",
  display: "swap",
});

const haskligItalic = localFont({
  src: "./hasklig/hasklig-it.ttf",
  variable: "--font-hasklig-it",
  display: "swap",
});

const haskligRegular = localFont({
  src: "./hasklig/hasklig-regular.ttf",
  variable: "--font-hasklig-regular",
  display: "swap",
});

const ibmPlexMono = localFont({
  src: "./i-b-m-plex-mono/i-b-m-plex-mono.ttf",
  variable: "--font-i-b-m-plex-mono",
  display: "swap",
});

const inconsolata = localFont({
  src: "./inconsolata/inconsolata.ttf",
  variable: "--font-inconsolata",
  display: "swap",
});

const iosevka = localFont({
  src: "./iosevka/iosevka-regular.woff2",
  variable: "--font-iosevka-regular",
  display: "swap",
});

const jetBrainsMono = localFont({
  src: "./jet-brains-mono/jet-brains-mono.ttf",
  variable: "--font-jet-brains-mono",
  display: "swap",
});
const majorMonoDisplay = localFont({
  src: "./major-mono/major-mono-display.ttf",
  variable: "--font-major-mono-display",
  display: "swap",
});
const monoidItalic = localFont({
  src: "./monoid/monoid-italic.ttf",
  variable: "--font-monoid-italic",
  display: "swap",
});

const monoidRegular = localFont({
  src: "./monoid/monoid-regular.ttf",
  variable: "--font-monoid-regular",
  display: "swap",
});

const monoidRetina = localFont({
  src: "./monoid/monoid-retina.ttf",
  variable: "--font-monoid-retina",
  display: "swap",
});

const robotoMono = localFont({
  src: "./roboto-mono/roboto-mono.ttf",
  variable: "--font-roboto-mono",
  display: "swap",
});

const sourceCodePro = localFont({
  src: "./source-code-pro/source-code-pro.ttf",
  variable: "--font-source-code-pro",
  display: "swap",
});

const sweet = localFont({
  src: "./sweet16/sweet.ttf",
  variable: "--font-sweet",
  display: "swap",
});

const syneMono = localFont({
  src: "./syne-mono/syne-mono.ttf",
  variable: "--font-syne-mono",
  display: "swap",
});

const ubuntuMono = localFont({
  src: "./ubuntu-mono/ubuntu-mono.ttf",
  variable: "--font-ubuntu-mono",
  display: "swap",
});

const victorMonoItalic = localFont({
  src: "./victor-mono-all/victor-mono-italic.woff2",
  variable: "--font-victor-mono-italic",
  display: "swap",
});

const victorMonoRegular = localFont({
  src: "./victor-mono-all/victor-mono-regular.woff2",
  variable: "--font-victor-mono-regular",
  display: "swap",
});

const xanhMonoItalic = localFont({
  src: "./xanh-mono/xanh-mono-italic.ttf",
  variable: "--font-xanh-mono-italic",
  display: "swap",
});

const xanhMonoRegular = localFont({
  src: "./xanh-mono/xanh-mono-regular.ttf",
  variable: "--font-xanh-mono-regular",
  display: "swap",
});

/* ------------------------------- */
/* Combined Variables              */
/* ------------------------------- */

const fontVariables = cn(
  cascadiaCode.variable,
  comicMono.variable,
  droidSansMono.variable,
  fantasqueSansMono.variable,
  firaCode.variable,
  hachiMaruPop.variable,
  hack.variable,
  haskligItalic.variable,
  haskligRegular.variable,
  ibmPlexMono.variable,
  inconsolata.variable,
  iosevka.variable,
  jetBrainsMono.variable,
  monoidItalic.variable,
  monoidRegular.variable,
  monoidRetina.variable,
  robotoMono.variable,
  sourceCodePro.variable,
  sweet.variable,
  syneMono.variable,
  ubuntuMono.variable,
  victorMonoItalic.variable,
  victorMonoRegular.variable,
  xanhMonoItalic.variable,
  xanhMonoRegular.variable,
  geistMono.variable,
  spaceMono.variable,
  dmMono.variable,
  commitMono.variable,
  // soehneMono.variable,
  majorMonoDisplay.variable,
  googleSansCode.variable,
);

export default fontVariables;
