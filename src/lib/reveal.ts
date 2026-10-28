const HERO_LEAD = 600;
const ENTRANCE_LENGTH = 2000;

declare global {
  interface Window {
    __reveal?: boolean;
  }
}

const afterPaint = (fn: () => void) =>
  requestAnimationFrame(() => requestAnimationFrame(fn));

export function revealOnScroll() {
  const sections = document.querySelectorAll<HTMLElement>("[data-reveal]");
  if (!sections.length || !("IntersectionObserver" in window)) return;
  window.__reveal = true;
  document.documentElement.dataset.reveal = "ready";

  const reveal = (section: HTMLElement) =>
    afterPaint(() => {
      section.dataset.revealed = "true";
      setTimeout(() => (section.dataset.revealed = "done"), ENTRANCE_LENGTH);
    });
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const section = entry.target as HTMLElement;
        observer.unobserve(section);
        if (entry.boundingClientRect.top < 0) {
          section.dataset.revealed = "instant";
          reveal(section);
          continue;
        }
        const wait = HERO_LEAD - performance.now();
        if (wait > 0) setTimeout(() => reveal(section), wait);
        else reveal(section);
      }
    },
    { rootMargin: "0px 0px -20% 0px" },
  );
  sections.forEach((section) => observer.observe(section));
}
