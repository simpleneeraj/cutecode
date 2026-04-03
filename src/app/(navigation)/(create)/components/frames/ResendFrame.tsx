import classNames from "classnames";
import { useAtom, useAtomValue , useSetAtom } from "jotai";






import Editor from "../Editor";
import sharedStyles from "./DefaultFrame.module.css";
import styles from "./ResendFrame.module.css";
import { elementDarkModeAtom, elementFileNameAtom, elementPaddingAtom, elementTransparentAtom, selectedLanguageAtom , updateSlideElementAtom} from "../../store/editor";


const ResendFrame = () => {
  const darkMode = useAtomValue(elementDarkModeAtom);
  const [padding] = useAtom(elementPaddingAtom);
  const [showBackground] = useAtom(elementTransparentAtom);
  const fileName = useAtomValue(elementFileNameAtom);
  const _updateElement = useSetAtom(updateSlideElementAtom);
  const selectedLanguage = useAtomValue(selectedLanguageAtom);

  return (
    <div
      className={classNames(
        sharedStyles.frame,
        styles.frame,
        darkMode && styles.darkMode,
        showBackground && styles.withBackground,
      )}
      style={{ padding }}
    >
      {!showBackground && <div data-ignore-in-export className={sharedStyles.transparentPattern}></div>}
      <div className={styles.window}>
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
            {fileName.length === 0 ? <span>Untitled-1</span> : null}
          </div>
          <span className={styles.language}>{selectedLanguage?.name}</span>
        </div>
        <Editor />
      </div>
    </div>
  );
};

export default ResendFrame;
