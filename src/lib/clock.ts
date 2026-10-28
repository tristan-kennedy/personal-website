export const clockFormat = (timeZone?: string) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

export function startClock(
  timeZone: string | undefined,
  render: (time: string) => void,
) {
  const format = clockFormat(timeZone);
  let timer: ReturnType<typeof setTimeout>;
  const tick = () => {
    render(format.format(new Date()));
    timer = setTimeout(tick, 60_000 - (Date.now() % 60_000));
  };
  tick();
  return () => clearTimeout(timer);
}
