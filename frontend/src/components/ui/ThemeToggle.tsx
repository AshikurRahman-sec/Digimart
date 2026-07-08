"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

type ThemePreference = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "digimart-theme";

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (typeof window === "undefined") {
    return "light";
  }

  if (preference === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  return preference;
}

export function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(STORAGE_KEY);
    const initialPreference =
      storedTheme === "light" || storedTheme === "dark" || storedTheme === "system"
        ? storedTheme
        : "system";

    setPreference(initialPreference);
    setResolvedTheme(resolveTheme(initialPreference));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const nextTheme = resolveTheme(preference);

    root.dataset.theme = nextTheme;
    root.dataset.themePreference = preference;
    root.style.colorScheme = nextTheme;
    window.localStorage.setItem(STORAGE_KEY, preference);
    setResolvedTheme(nextTheme);
  }, [preference]);

  useEffect(() => {
    if (preference !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const nextTheme = resolveTheme("system");
      document.documentElement.dataset.theme = nextTheme;
      document.documentElement.style.colorScheme = nextTheme;
      setResolvedTheme(nextTheme);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [preference]);

  const options: Array<{ value: ThemePreference; label: string }> = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
  ];

  const StatusIcon = preference === "system" ? Monitor : resolvedTheme === "dark" ? Moon : Sun;

  return (
    <div className="theme-toggle" aria-label="Theme selection">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`theme-toggle-option ${preference === option.value ? "active" : ""}`}
          onClick={() => setPreference(option.value)}
          aria-pressed={preference === option.value}
        >
          {option.label}
        </button>
      ))}
      <span className="theme-toggle-status" aria-label={`${resolvedTheme} theme active`}>
        <StatusIcon size={15} />
      </span>
    </div>
  );
}
