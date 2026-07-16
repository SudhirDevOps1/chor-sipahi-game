"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className="icon-button" aria-label={dark ? "Use light theme" : "Use dark theme"}>
      {dark ? <Sun size={17} strokeWidth={2.2} /> : <Moon size={17} strokeWidth={2.2} />}
    </button>
  );
}
