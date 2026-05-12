import { useEffect, useState } from "react";
import { LuArrowUp } from "react-icons/lu";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const percent =
        maxScroll <= 0
          ? 0
          : Math.min(100, Math.round((scrollTop / maxScroll) * 100));

      setVisible(scrollTop > 400);
      setProgressPercent(percent);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`group fixed right-4 bottom-4 z-[60] inline-flex items-center gap-3 transition-all sm:right-6 sm:bottom-6 lg:right-12 lg:bottom-12 ${
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      }`}
      aria-label="Scroll to top"
    >
      <span className="relative flex h-6 min-w-[4.35rem] items-center justify-center overflow-hidden border border-divider bg-bg px-1.5">
        <span className="relative z-10 text-[0.5rem] tracking-[0.16rem] text-subtle tabular-nums transition-colors group-hover:text-accent">
          {String(progressPercent).padStart(2, "0")} / 100
        </span>
      </span>

      <span className="relative flex size-8 items-center justify-center overflow-hidden bg-secondary text-primary transition-colors group-hover:bg-accent">
        <span
          className="absolute inset-x-0 top-0 bg-primary transition-all duration-200 group-hover:bg-accent"
          style={{ height: `${progressPercent}%` }}
          aria-hidden="true"
        />
        <span className="relative z-10 text-bg">
          <LuArrowUp aria-hidden="true" />
        </span>
      </span>
    </button>
  );
}
