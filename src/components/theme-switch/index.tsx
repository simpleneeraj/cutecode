"use client";

import { useTheme } from "next-themes";
import { useId, useState } from "react";
import { Button } from "../ui/button";
import { Layers } from "@solar-icons/react";

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme();

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

  return (
    <Button className="relative size-8" onClick={smartToggle} size="icon" title="Toggle theme" variant="outline">
      <Layers weight="BoldDuotone" className="-rotate-45 size-4" aria-hidden="true" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
