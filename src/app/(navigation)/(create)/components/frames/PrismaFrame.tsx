import classNames from "classnames";
import { useAtom, useAtomValue , useSetAtom } from "jotai";


import { flashShownAtom } from "../../store/flash";



import Editor from "../Editor";
import sharedStyles from "./DefaultFrame.module.css";
import styles from "./PrismaFrame.module.css";
import { elementDarkModeAtom, elementFileNameAtom, elementPaddingAtom, elementTransparentAtom , updateSlideElementAtom} from "../../store/editor";


const PrismaFrame = () => {
  const darkMode = useAtomValue(elementDarkModeAtom);
  const [padding] = useAtom(elementPaddingAtom);
  const [showBackground] = useAtom(elementTransparentAtom);
  const fileName = useAtomValue(elementFileNameAtom);
  const _updateElement = useSetAtom(updateSlideElementAtom);
  const flashShown = useAtomValue(flashShownAtom);

  return (
    <div
      className={classNames(
        sharedStyles.frame,
        styles.frame,
        !darkMode && styles.frameLightMode,
        !showBackground && sharedStyles.noBackground,
        !showBackground && styles.noBackground,
      )}
      style={{ padding }}
    >
      {!showBackground && <div data-ignore-in-export className={sharedStyles.transparentPattern}></div>}
      <div className={styles.window}>
        <span data-frameborder />
        <span data-frameborder />
        <span data-frameborder />
        <span data-frameborder />
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
          </div>
        )}
        <Editor />
      </div>
    </div>
  );
};

export default PrismaFrame;
