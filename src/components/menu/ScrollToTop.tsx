import { useEffect, useState } from "react";
import { LuArrowUp } from "react-icons/lu";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`group h2 right-vw fixed right-4 bottom-4 rounded-4xl p-2 backdrop-blur-xs transition-all hover:scale-[1.1] active:scale-[0.90] sm:right-6 sm:bottom-6 lg:right-12 lg:bottom-12 ${
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      } `}
      aria-label="Scroll to top"
    >
      <span className="relative flex items-center font-medium">
        TOP <LuArrowUp />
      </span>
    </button>
  );
}
