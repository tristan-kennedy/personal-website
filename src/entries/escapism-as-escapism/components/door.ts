import { reducedMotion } from "../../../lib/motion";

const OPEN_BY = 0.7;

const easeInOut = (t: number) => t * t * (3 - 2 * t);

export const openDoorOnScroll = () => {
  if (reducedMotion().matches) return;
  const door = document.querySelector<HTMLElement>("[data-door]")!;
  const stage = door.querySelector<HTMLElement>("[data-stage]")!;
  door.dataset.walk = "true";

  let queued = false;
  const update = () => {
    queued = false;
    const travel = (door.offsetHeight - innerHeight) * OPEN_BY;
    const walked = Math.max(
      0,
      Math.min(1, (scrollY - door.offsetTop) / travel),
    );
    stage.style.setProperty("--open", String(easeInOut(walked)));
  };
  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };

  addEventListener("scroll", queue, { passive: true });
  addEventListener("resize", queue);
  update();
};
