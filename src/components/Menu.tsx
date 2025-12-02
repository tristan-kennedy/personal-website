import { useEffect, useState } from "react";
import { CiMenuBurger } from "react-icons/ci";
import ThemeToggle from "./ThemeToggle";
import { LuX } from "react-icons/lu";

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
      <button
        onClick={() => setOpen(true)}
        className="group cursor-pointer rounded-2xl px-1 py-2 transition-all hover:scale-[1.1] active:scale-[0.90]"
        aria-label="Toggle menu open"
      >
        <CiMenuBurger size={24} />
      </button>

      <div
        className={`fixed inset-0 bg-bg/33 backdrop-blur-sm transition-opacity ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"} `}
        onClick={() => setOpen(false)}
      />

      <aside
        className={`text-white fixed top-0 right-0 z-50 h-full w-96 transform px-10 py-12 transition-transform ${open ? "translate-x-0" : "translate-x-full"} flex flex-col justify-between`}
      >
        <div className="grid gap-8">
          <button
            onClick={() => setOpen(false)}
            className="h2 flex cursor-pointer items-center justify-end gap-2 text-right transition-all hover:opacity-80 active:scale-[0.90]"
          >
            CLOSE
            <LuX size={16} />
          </button>
          <nav className="mt-4 grid gap-6 text-5xl leading-tight">
            <a href="/projects" className="transition-colors hover:text-accent">
              Projects
            </a>
            <a href="/blog" className="transition-colors hover:text-accent">
              Posts
            </a>
            <a href="/contact" className="transition-colors hover:text-accent">
              Experiments
            </a>
          </nav>
        </div>

        <ThemeToggle />
      </aside>
    </>
  );
}
