import { useEffect, useLayoutEffect, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { LuX } from "react-icons/lu";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Posts", href: "/posts" },
  { label: "Experiments", href: "/experiments" },
];

export default function Menu() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [currentPath, setCurrentPath] = useState("");
  const transitionName = "menu-transition";

  const updateOrigin = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    setOrigin({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  };

  const handleOpen = () => {
    updateOrigin();
    requestAnimationFrame(() => setOpen(true));
  };

  const handleClose = () => {
    updateOrigin();
    setOpen(false);
  };

  useLayoutEffect(() => {
    updateOrigin();
    const handleResize = () => updateOrigin();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        onClick={handleOpen}
        ref={buttonRef}
        className="group flex items-center gap-3 rounded-2xl px-1 py-2 text-secondary transition-all hover:scale-[1.1] active:scale-[0.9]"
        aria-label="Open menu"
      >
        <span
          className="h-12 w-12 bg-accent"
          style={{ viewTransitionName: open ? "" : transitionName }}
          aria-hidden="true"
        />
      </button>

      <aside
        className={`fixed inset-0 z-[100] bg-accent text-bg ${open ? "pointer-events-auto" : "pointer-events-none"} `}
        style={{
          clipPath: `circle(${open ? "150%" : "0%"} at ${origin.x}px ${origin.y}px)`,
          transition: "clip-path 450ms ease-in-out",
          viewTransitionName: open ? transitionName : "",
        }}
        role="dialog"
        aria-modal="true"
      >
        <div className="mx-auto flex h-full max-w-[1440px] flex-col py-8">
          <header className="flex items-center justify-between">
            <h2 className="text-bg">MENU</h2>
            <button
              onClick={handleClose}
              className="h2 flex items-center gap-2 text-bg transition-all hover:scale-[1.05] active:scale-[0.98]"
              aria-label="Close menu"
            >
              CLOSE
              <LuX size={16} />
            </button>
          </header>

          <nav className="my-auto">
            <ul className="flex flex-col gap-6">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  currentPath === item.href ||
                  (item.href === "/" && currentPath === "/");

                return (
                  <li key={item.href} className="group">
                    <h1 className="text-[clamp(3rem,6vw,6rem)] leading-none tracking-tight">
                      <a
                        href={item.href}
                        className={`block transition-all group-hover:translate-x-2 ${
                          isActive
                            ? "opacity-100"
                            : "opacity-70 group-hover:opacity-100"
                        }`}
                      >
                        {isActive ? "– " : ""}
                        {item.label}
                      </a>
                    </h1>
                  </li>
                );
              })}
            </ul>
          </nav>

          <footer className="flex items-center justify-end">
            <ThemeToggle />
          </footer>
        </div>
      </aside>
    </>
  );
}
