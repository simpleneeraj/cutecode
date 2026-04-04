"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Moon, Sun } from "lucide-react";

export default function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — only render icon after mount
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button size="icon" variant="outline" className="relative size-8" aria-label="Toggle theme">
        <span className="size-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      size="icon"
      variant="outline"
      className="relative size-8 transition-all"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <Sun
        className="size-4 rotate-0 scale-100 transition-all duration-200 dark:-rotate-90 dark:scale-0"
        aria-hidden
      />
      <Moon
        className="absolute size-4 rotate-90 scale-0 transition-all duration-200 dark:rotate-0 dark:scale-100"
        aria-hidden
      />
      <span className="sr-only">{isDark ? "Switch to light mode" : "Switch to dark mode"}</span>
    </Button>
  );
}
