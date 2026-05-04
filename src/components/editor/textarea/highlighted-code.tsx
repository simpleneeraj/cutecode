import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { Language, LANGUAGES } from "../util/languages";

import styles from "@/styles/editor/Editor.module.css";
import { useAtomValue, useSetAtom } from "jotai";
import { PreviewEditorContext } from "../PreviewEditorContext";
import {
  elementThemeAtom,
  themeDarkModeAtom,
  loadingLanguageAtom,
  elementHighlightedLinesAtom,
} from "@/store/editor/editor";
import { useEditorContext } from "@/store/editor/context/editor";
import { themes } from "@/components/editor/themes";

type PropTypes = {
  selectedLanguage: Language | null;
  code: string;
};

const HighlightedCode: React.FC<PropTypes> = ({ selectedLanguage, code }) => {
  const previewData = React.useContext(PreviewEditorContext);
  const [highlightedHtml, setHighlightedHtml] = useState("");
  const { highlighter } = useEditorContext();
  const setIsLoadingLanguage = useSetAtom(loadingLanguageAtom);

  // Use preview data if available, else Jotai
  const jotaiHighlightedLines = useAtomValue(elementHighlightedLinesAtom);
  const jotaiDarkMode = useAtomValue(themeDarkModeAtom);
  const jotaiThemeId = useAtomValue(elementThemeAtom);

  const highlightedLines = previewData ? previewData.properties?.highlightedLines || [] : jotaiHighlightedLines;
  const darkMode = previewData ? (previewData.properties?.darkMode ?? true) : jotaiDarkMode;
  const themeId = previewData ? previewData.properties?.theme || "default" : jotaiThemeId;

  // Route to the correct Shiki theme name:
  //  - "tailwind" → tailwind-light / tailwind-dark (custom JSON themes)
  //  - group === "Shiki" → use the theme id directly (native Shiki bundled theme)
  //  - everything else → "cutecode-theme" (CSS variables driven by custom themes)
  const isShikiBuiltin = themes[themeId]?.group === "Shiki";
  const themeName =
    themeId === "tailwind"
      ? darkMode
        ? "tailwind-dark"
        : "tailwind-light"
      : isShikiBuiltin
        ? themeId
        : "cutecode-theme";

  useEffect(() => {
    const generateHighlightedHtml = async () => {
      if (!highlighter || !selectedLanguage || selectedLanguage === LANGUAGES.plaintext) {
        return code?.replace(/[\u00A0-\u9999<>\&]/g, (i) => `&#${i.charCodeAt(0)};`);
      }

      const loadedLanguages = highlighter.getLoadedLanguages() || [];
      const hasLoadedLanguage = loadedLanguages.includes(selectedLanguage.name.toLowerCase());

      if (!hasLoadedLanguage && selectedLanguage.src) {
        setIsLoadingLanguage(true);
        await highlighter.loadLanguage(selectedLanguage.src);
        setIsLoadingLanguage(false);
      }

      let lang = selectedLanguage.name.toLowerCase();
      if (lang === "typescript") {
        lang = "tsx";
      }

      return highlighter.codeToHtml(code, {
        lang: lang,
        theme: themeName,
        transformers: [
          {
            line(node, line) {
              node.properties["data-line"] = line;
              if (highlightedLines.includes(line)) this.addClassToHast(node, "highlighted-line");
            },
          },
        ],
      });
    };

    generateHighlightedHtml().then((newHtml) => {
      setHighlightedHtml(newHtml);
    });
  }, [code, selectedLanguage, highlighter, setIsLoadingLanguage, setHighlightedHtml, highlightedLines, themeName]);

  return (
    <div
      className={classNames(styles.formatted, selectedLanguage === LANGUAGES.plaintext && styles.plainText)}
      dangerouslySetInnerHTML={{
        __html: highlightedHtml,
      }}
    />
  );
};

export default HighlightedCode;
