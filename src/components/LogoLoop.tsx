import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FaLinkedin,
  FaSpotify,
  FaSquareGithub,
  FaSquareLetterboxd,
  FaSuitcase,
} from "react-icons/fa6";

const LOGO_GAP = 40;

type LogoItem = {
  node: React.ReactNode;
  href?: string;
  title?: string;
  ariaLabel?: string;
};

const LOGOS: LogoItem[] = [
  {
    node: <FaSquareLetterboxd className="text-aqua" />,
    title: "Letterboxd",
    href: "https://letterboxd.com/tdouglaskennedy/",
  },
  {
    node: <FaSpotify className="text-green" />,
    title: "Spotify",
    href: "https://open.spotify.com/user/31xwvr4ulkri5dcvyl44k6sixo64?si=88800292b3914068",
  },
  {
    node: <FaSquareGithub />,
    title: "Github",
    href: "https://github.com/tristan-kennedy",
  },
  {
    node: <FaLinkedin className="text-blue" />,
    title: "Linkedin",
    href: "https://www.linkedin.com/in/tristandkennedy/",
  },
  {
    node: <FaSuitcase className="text-orange" />,
    title: "Resume",
    href: "#",
  },
];

const ANIMATION_CONFIG = {
  SMOOTH_TAU: 0.25,
  MIN_COPIES: 2,
  COPY_HEADROOM: 2,
} as const;

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

const useResizeObserver = (
  callback: () => void,
  elements: Array<React.RefObject<Element | null>>,
  dependencies: React.DependencyList,
) => {
  useEffect(() => {
    if (!window.ResizeObserver) {
      const handleResize = () => callback();
      window.addEventListener("resize", handleResize);
      callback();
      return () => window.removeEventListener("resize", handleResize);
    }

    const observers = elements.map((ref) => {
      if (!ref.current) return null;
      const observer = new ResizeObserver(callback);
      observer.observe(ref.current);
      return observer;
    });

    callback();

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, dependencies);
};

const useAnimationLoop = (
  trackRef: React.RefObject<HTMLDivElement | null>,
  targetVelocity: number,
  seqWidth: number,
  isHovered: boolean,
  pauseOnHover: boolean,
) => {
  const rafRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (seqWidth > 0) {
      offsetRef.current =
        ((offsetRef.current % seqWidth) + seqWidth) % seqWidth;
      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
    }

    if (prefersReduced) {
      track.style.transform = "translate3d(0, 0, 0)";
      return () => {
        lastTimestampRef.current = null;
      };
    }

    const animate = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }

      const deltaTime =
        Math.max(0, timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      const target = pauseOnHover && isHovered ? 0 : targetVelocity;

      const easingFactor =
        1 - Math.exp(-deltaTime / ANIMATION_CONFIG.SMOOTH_TAU);
      velocityRef.current += (target - velocityRef.current) * easingFactor;

      if (seqWidth > 0) {
        let nextOffset = offsetRef.current + velocityRef.current * deltaTime;
        nextOffset = ((nextOffset % seqWidth) + seqWidth) % seqWidth;
        offsetRef.current = nextOffset;

        const translateX = -offsetRef.current;
        track.style.transform = `translate3d(${translateX}px, 0, 0)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTimestampRef.current = null;
    };
  }, [targetVelocity, seqWidth, isHovered, pauseOnHover]);
};

export const LogoLoop = React.memo(() => {
  const logosList = LOGOS;
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const seqRef = useRef<HTMLUListElement>(null);

  const [seqWidth, setSeqWidth] = useState<number>(0);
  const [copyCount, setCopyCount] = useState<number>(
    ANIMATION_CONFIG.MIN_COPIES,
  );
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const targetVelocity = useMemo(() => 60, []);

  const updateDimensions = useCallback(() => {
    const containerWidth = containerRef.current?.clientWidth ?? 0;
    const sequenceWidth = seqRef.current?.getBoundingClientRect?.()?.width ?? 0;

    if (sequenceWidth > 0) {
      setSeqWidth(Math.ceil(sequenceWidth));
      const copiesNeeded =
        Math.ceil(containerWidth / sequenceWidth) +
        ANIMATION_CONFIG.COPY_HEADROOM;
      setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES, copiesNeeded));
    }
  }, []);

  useResizeObserver(
    updateDimensions,
    [containerRef, seqRef],
    [logosList, LOGO_GAP],
  );

  useAnimationLoop(trackRef, targetVelocity, seqWidth, isHovered, true);

  const cssVariables = {
    "--logoloop-gap": `${LOGO_GAP}px`,
    "--logoloop-logoHeight": `100%`,
  } as React.CSSProperties;

  const rootClasses = cx(
    "relative h-full overflow-hidden group transition-colors",
    "[--logoloop-gap:32px]",
    "[--logoloop-fadeColorAuto:var(--color-bg)]",
    "py-2 sm:py-3",
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const renderLogoItem = useCallback((item: LogoItem, key: React.Key) => {
    const content = (
      <span
        className={cx(
          "inline-flex h-full origin-center items-center",
          "[&>svg]:block [&>svg]:h-full [&>svg]:w-auto",
          "motion-reduce:transition-none",
          "transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover/item:scale-110",
        )}
        aria-hidden={!!item.href && !item.ariaLabel}
      >
        {item.node}
      </span>
    );

    const itemAriaLabel = item.ariaLabel ?? item.title;

    const inner = item.href ? (
      <a
        className={cx(
          "inline-flex h-full items-center rounded no-underline",
          "transition-opacity duration-200 ease-linear",
          "hover:opacity-80",
          "focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-current",
        )}
        href={item.href}
        aria-label={itemAriaLabel || "logo link"}
        target="_blank"
        rel="noreferrer noopener"
      >
        {content}
      </a>
    ) : (
      content
    );

    return (
      <li
        className={cx(
          "mr-[var(--logoloop-gap)] h-full flex-none leading-[1]",
          "group/item overflow-visible",
        )}
        key={key}
        role="listitem"
      >
        {inner}
      </li>
    );
  }, []);

  const logoLists = useMemo(
    () =>
      Array.from({ length: copyCount }, (_, copyIndex) => (
        <ul
          className="flex h-full items-stretch"
          key={`copy-${copyIndex}`}
          role="list"
          aria-hidden={copyIndex > 0}
          ref={copyIndex === 0 ? seqRef : undefined}
        >
          {logosList.map((item, itemIndex) =>
            renderLogoItem(item, `${copyIndex}-${itemIndex}`),
          )}
        </ul>
      )),
    [copyCount, logosList, renderLogoItem],
  );

  const containerStyle: React.CSSProperties = {
    width: "100%",
    ...cssVariables,
  };

  return (
    <div
      ref={containerRef}
      className={rootClasses}
      style={containerStyle}
      role="region"
      aria-label={"Technology partners"}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={cx(
          "flex h-full w-max items-stretch will-change-transform select-none",
          "motion-reduce:transform-none",
        )}
        ref={trackRef}
      >
        {logoLists}
      </div>
    </div>
  );
});

export default LogoLoop;
