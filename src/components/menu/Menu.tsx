import { useEffect, useState } from "react";
import Tooltip from "../Tooltip";

export default function Menu() {
  const [shouldPulse, setShouldPulse] = useState(false);

  const handleOpen = () => {
    setShouldPulse(false);
    sessionStorage.setItem("menu-opened", "true");
    document.documentElement.setAttribute("data-menu-transition", "true");
  };

  useEffect(() => {
    const hasOpened = sessionStorage.getItem("menu-opened") === "true";
    setShouldPulse(!hasOpened);
  }, []);

  return (
    <Tooltip label="MENU">
      <a
        href="/menu"
        onClick={handleOpen}
        className="group relative flex items-center gap-3 rounded-2xl px-1 py-2 text-secondary transition-all hover:scale-[1.1] active:scale-[0.9]"
        aria-label="Open menu"
      >
        <span
          data-menu-square
          className={`h-12 w-12 bg-accent ${shouldPulse ? "animate-bounce" : ""}`}
          aria-hidden="true"
          style={{ viewTransitionName: "menu-transition" }}
        />
      </a>
    </Tooltip>
  );
}
