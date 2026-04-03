import classNames from "classnames";
import { useAtom, useAtomValue } from "jotai";





import Editor from "../Editor";
import sharedStyles from "./DefaultFrame.module.css";
import styles from "./SupabaseFrame.module.css";
import { elementDarkModeAtom, elementPaddingAtom, elementTransparentAtom } from "../../store/editor";


const SupabaseFrame = () => {
  const darkMode = useAtomValue(elementDarkModeAtom);
  const [padding] = useAtom(elementPaddingAtom);
  const [showBackground] = useAtom(elementTransparentAtom);

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
        <Editor />
      </div>
    </div>
  );
};

export default SupabaseFrame;
