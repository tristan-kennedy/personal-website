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
      className="group h2 cursor-pointer transition-all duration-200 active:scale-[0.90]"
      aria-label="Toggle theme"
    >
      LIGHT / DARK
    </button>
  );
}
