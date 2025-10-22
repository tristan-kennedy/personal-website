import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const toggleTheme = () => {
    const newTheme =
      document.documentElement.getAttribute("data-theme") === "light"
        ? "dark"
        : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="cursor-pointer rounded-2xl border-2 px-4 py-2 hover:bg-bg1"
      aria-label="Toggle theme"
    >
      <Moon className="dark:hidden" />
      <Sun className="hidden dark:block" />
    </button>
  );
}
