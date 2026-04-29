import { useAtomValue } from "jotai";
import UnifiedFrame from "./UnifiedFrame";
import DefaultFrame from "./DefaultFrame";
import {
  elementDarkModeAtom,
  elementFileNameAtom,
  elementPaddingAtom,
  elementTransparentAtom,
  selectedLanguageAtom,
  themeBackgroundAtom,
  windowWidthAtom,
  elementContentAtom,
  exportSizeAtom,
  updateSlideElementAtom,
} from "../../store/editor";
import { useSetAtom } from "jotai";
import { flashShownAtom } from "../../store/flash";
import { BaseFrameProps, getFrameConfig } from "./config";
export type { BaseFrameProps };

type PresetsProps = {
  id: string;
};

function Presets({ id }: PresetsProps) {
  const padding = useAtomValue(elementPaddingAtom);
  const darkMode = useAtomValue(elementDarkModeAtom);
  const transparent = useAtomValue(elementTransparentAtom);
  const themeBackground = useAtomValue(themeBackgroundAtom);
  const fileName = useAtomValue(elementFileNameAtom);
  const selectedLanguage = useAtomValue(selectedLanguageAtom) || null;
  const flashShown = useAtomValue(flashShownAtom);
  const windowWidth = useAtomValue(windowWidthAtom);
  const code = useAtomValue(elementContentAtom);
  const exportSize = useAtomValue(exportSizeAtom);
  const updateElement = useSetAtom(updateSlideElementAtom);

  const frameProps: BaseFrameProps = {
    padding,
    darkMode,
    transparent,
    themeBackground,
    fileName,
    selectedLanguage,
    flashShown,
    windowWidth,
    code,
    exportSize,
    themeId: id,
    onFileNameChange: (name: string) => updateElement({ header: { properties: { title: { text: name } } } }),
  };

  const config = getFrameConfig(id);

  if (config.Component) {
    return <config.Component {...frameProps} />;
  }

  if (config.styles) {
    return <UnifiedFrame themeStyles={config.styles} {...frameProps} />;
  }

  return <DefaultFrame {...frameProps} />;
}

export default Presets;
