import Editor from "../Editor";
// sharedStyles removed because ThemeWrapper uses it internally
import styles from "./NuxtFrame.module.css";
import ThemeWrapper from "./ThemeWrapper";
import { BaseFrameProps } from "./index";

const NuxtFrame = ({ padding, darkMode, transparent }: BaseFrameProps) => {
  return (
    <ThemeWrapper themeStyles={styles} padding={padding} darkMode={darkMode} transparent={transparent}>
      <img src="/stars.svg" alt="stars" className={styles.stars} />
      <div className={styles.window}>
        <span data-frameborder />
        <span data-frameborder />
        <span data-frameborder />
        <Editor />
      </div>
    </ThemeWrapper>
  );
};

export default NuxtFrame;
