import { LuMoon, LuSun } from "react-icons/lu";

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
      className="cursor-pointer rounded-2xl p-2 transition-colors hover:text-fg3 active:scale-95 active:text-fg4"
      aria-label="Toggle theme"
    >
      <LuMoon className="dark:hidden" size={24} />
      <LuSun className="hidden dark:block" size={24} />
    </button>
  );
}
