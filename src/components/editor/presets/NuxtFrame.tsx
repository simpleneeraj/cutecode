import ThemeWrapper from "./ThemeWrapper";
import { BaseFrameProps } from "@/typings/presets";
import styles from "@/styles/presets/NuxtFrame.module.css";

const NuxtFrame = ({ padding, darkMode, transparent, children }: BaseFrameProps) => {
  return (
    <ThemeWrapper themeStyles={styles} padding={padding} darkMode={darkMode} transparent={transparent}>
      <img src="/stars.svg" alt="stars" className={styles.stars} />
      <div className={styles.window}>
        <span data-frameborder />
        <span data-frameborder />
        <span data-frameborder />
        {children}
      </div>
    </ThemeWrapper>
  );
};

export default NuxtFrame;
