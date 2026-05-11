import { useTheme } from "next-themes";

const useSmartToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const smartToggle = () => {
    /* The smart toggle by @nrjdalal */
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (theme === "system") {
      setTheme(prefersDarkScheme ? "light" : "dark");
    } else if ((theme === "light" && !prefersDarkScheme) || (theme === "dark" && prefersDarkScheme)) {
      setTheme(theme === "light" ? "dark" : "light");
    } else {
      setTheme("system");
    }
  };

  const isDark = resolvedTheme === "dark";

  return { theme, smartToggle, isDark };
};

export default useSmartToggle;
