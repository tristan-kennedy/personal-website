import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const current =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "dark"
        : "light";
    setTheme(current);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="group h2 flex items-center gap-2 text-bg transition-colors transition-transform hover:scale-[1.05] active:scale-[0.98]"
      aria-label="Toggle theme"
    >
      <span
        className={`h2 transition-colors ${
          theme === "light" ? "font-bold text-bg" : "text-bg/70"
        }`}
      >
        LIGHT
      </span>
      <span>/</span>
      <span
        className={`h2 transition-colors ${
          theme === "dark" ? "font-bold text-bg" : "text-bg/70"
        }`}
      >
        DARK
      </span>
    </button>
  );
}
