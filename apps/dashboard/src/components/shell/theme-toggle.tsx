"use client";
import * as React from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = React.useState(false);
  React.useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("pai-theme", next ? "dark" : "light");
    } catch {}
  };
  return (
    <button onClick={toggle} className={className ?? "rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"} aria-label="Toggle dark mode" title="Toggle dark mode">
      {dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </button>
  );
}
