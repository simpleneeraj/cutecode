import classNames from "classnames";
import { useAtom, useAtomValue , useSetAtom } from "jotai";



import { flashShownAtom } from "../../store/flash";



import Editor from "../Editor";
import sharedStyles from "./DefaultFrame.module.css";
import styles from "./CloudflareFrame.module.css";
import { elementDarkModeAtom, elementFileNameAtom, elementPaddingAtom, elementTransparentAtom, selectedLanguageAtom , updateSlideElementAtom} from "../../store/editor";


const CloudflareFrame = () => {
  const darkMode = useAtomValue(elementDarkModeAtom);
  const [padding] = useAtom(elementPaddingAtom);
  const [showBackground] = useAtom(elementTransparentAtom);
  const fileName = useAtomValue(elementFileNameAtom);
  const _updateElement = useSetAtom(updateSlideElementAtom);
  const [selectedLanguage] = useAtom(selectedLanguageAtom);
  const flashShown = useAtomValue(flashShownAtom);

  return (
    <div
      className={classNames(
        sharedStyles.frame,
        showBackground && styles.frame,
        !darkMode && styles.frameLightMode,
        !showBackground && sharedStyles.noBackground,
        !showBackground && styles.noBackground,
      )}
      style={{ padding }}
    >
      {!showBackground && <div data-ignore-in-export className={sharedStyles.transparentPattern}></div>}
      <div className={styles.window}>
        <span className={styles.gridlinesHorizontal} data-grid></span>
        <span className={styles.gridlinesVertical} data-grid></span>
        {fileName.length > 0 ? (
          <div className={styles.header}>
            <div className={classNames(sharedStyles.fileName, styles.fileName)} data-value={fileName}>
              <input
                type="text"
                value={fileName}
                onChange={(event) => _updateElement({ header: { properties: { title: { text: event.target.value } } } })}
                spellCheck={false}
                tabIndex={-1}
                size={1}
              />
            </div>
            <span className={styles.language}>{selectedLanguage?.name}</span>
          </div>
        ) : flashShown ? null : (
          <div className={styles.header} data-ignore-in-export>
            <div className={classNames(sharedStyles.fileName, styles.fileName)} data-value={fileName}>
              <input
                type="text"
                value={fileName}
                onChange={(event) => _updateElement({ header: { properties: { title: { text: event.target.value } } } })}
                spellCheck={false}
                tabIndex={-1}
                size={1}
              />
              <span>Untitled-1</span>
            </div>
            <span className={styles.language}>{selectedLanguage?.name}</span>
          </div>
        )}
        <Editor />
      </div>
    </div>
  );
};

export default CloudflareFrame;
