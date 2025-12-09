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
      className="group h2 cursor-pointer transition-all hover:scale-[1.1] active:scale-[0.90]"
      aria-label="Toggle theme"
    >
      <span className="font-bold dark:font-normal">LIGHT</span>
      <span> / </span>
      <span className="font-normal dark:font-bold">DARK</span>
    </button>
  );
}
