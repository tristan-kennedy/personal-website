import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { LuMenu, LuX } from "react-icons/lu";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Posts", href: "/blog" },
  { label: "Experiments", href: "/experiments" },
];

export default function Menu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* OPEN BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="group rounded-2xl px-1 py-2 text-secondary transition-all hover:scale-[1.1] active:scale-[0.9]"
        aria-label="Open menu"
      >
        <LuMenu size={24} />
      </button>

      {/* FULL PAGE OVERLAY */}
      <aside
        className={`fixed inset-0 z-[100] bg-accent text-bg transition-opacity duration-300 ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"} `}
        role="dialog"
        aria-modal="true"
      >
        <div className="mx-auto flex h-full max-w-6xl flex-col px-8 py-10">
          {/* HEADER */}
          <header className="flex items-center justify-between">
            <span className="text-sm tracking-wide opacity-70">MENU</span>
            <button
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 text-sm transition-all hover:scale-[1.1]"
              aria-label="Close menu"
            >
              CLOSE
              <LuX size={16} />
            </button>
          </header>

          {/* NAV */}
          <nav className="my-auto flex flex-col gap-6">
            {NAV_ITEMS.map((item) => {
              const isActive =
                location.pathname === item.href ||
                (item.href === "/" && location.pathname === "/");

              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`text-[clamp(3rem,6vw,6rem)] leading-none tracking-tight transition-all hover:translate-x-2 ${
                    isActive ? "opacity-100" : "opacity-70 hover:opacity-100"
                  } `}
                >
                  {isActive ? "– " : ""}
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* FOOTER */}
          <footer className="flex items-center justify-between text-sm opacity-70">
            <span>© {new Date().getFullYear()} Tristan Kennedy</span>
            <ThemeToggle />
          </footer>
        </div>
      </aside>
    </>
  );
}
