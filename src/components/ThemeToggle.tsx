
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (!mounted) return;
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="glass"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative h-10 w-10 rounded-full border border-white/25 bg-background/45 backdrop-blur-md transition-all duration-300 hover:scale-[1.04] hover:border-white/40 hover:bg-background/70 hover:shadow-[0_0_18px_rgba(255,255,255,0.15)] dark:border-white/20 dark:hover:shadow-[0_0_22px_rgba(74,222,128,0.24)]"
    >
      <Sun
        className={`absolute h-[1rem] w-[1rem] text-amber-300 transition-all duration-500 ease-out ${
          isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
      />
      <Moon
        className={`absolute h-[1rem] w-[1rem] text-slate-100 transition-all duration-500 ease-out ${
          isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
        }`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
