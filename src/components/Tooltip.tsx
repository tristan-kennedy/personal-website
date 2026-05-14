import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type TooltipPosition = {
  x: number;
  y: number;
};

type TooltipOffset = {
  x: number;
  y: number;
};

type TooltipProps = {
  label: string;
  children: React.ReactNode;
  offset?: TooltipOffset;
  className?: string;
  tooltipClassName?: string;
};

const defaultOffset: TooltipOffset = { x: 12, y: -12 };

export default function Tooltip({
  label,
  children,
  offset = defaultOffset,
  className = "",
  tooltipClassName = "",
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    setPosition({ x: event.clientX, y: event.clientY });
  };

  const left = position.x + offset.x;
  const top = position.y + offset.y;
  const tooltip = (
    <span
      className={`pointer-events-none fixed z-[110] ${tooltipClassName}`}
      style={{ left, top, transform: "translateY(-100%)" }}
      aria-hidden="true"
    >
      <span
        className={`block bg-primary px-3 py-2 text-xs tracking-[0.2rem] text-bg transition-all duration-150 ease-out ${
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-1 scale-95 opacity-0"
        }`}
        style={{ transitionDelay: visible ? "350ms" : "0ms" }}
      >
        {label}
      </span>
    </span>
  );

  return (
    <div
      className={className}
      onPointerEnter={() => setVisible(true)}
      onPointerLeave={() => setVisible(false)}
      onPointerMove={handlePointerMove}
    >
      {mounted && createPortal(tooltip, document.body)}
      {children}
    </div>
  );
}
