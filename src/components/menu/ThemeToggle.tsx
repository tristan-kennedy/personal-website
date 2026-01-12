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
      className="group h2 flex items-center gap-3 text-bg transition-all hover:scale-[1.1] active:scale-[0.90]"
      aria-label="Toggle theme"
    >
      <span className="flex items-center gap-2">
        <span className={theme === "light" ? "font-bold" : "font-normal"}>
          LIGHT
        </span>
      </span>
      <span>/</span>
      <span className="flex items-center gap-2">
        <span className={theme === "dark" ? "font-bold" : "font-normal"}>
          DARK
        </span>
      </span>
    </button>
  );
}
