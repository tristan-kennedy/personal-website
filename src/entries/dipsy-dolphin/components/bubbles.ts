export type Bubble = {
  fill: string;
  edge: string;
  ink: string;
  dashed?: boolean;
  instant?: boolean;
  chunk: number;
  pause: number;
  hold: number;
};

export const BUBBLES: Record<string, Bubble> = {
  normal: {
    fill: "#fff7e6",
    edge: "#1b263b",
    ink: "#102226",
    chunk: 28,
    pause: 150,
    hold: 2200,
  },
  joke: {
    fill: "#fff1bf",
    edge: "#d97706",
    ink: "#3a2208",
    chunk: 24,
    pause: 180,
    hold: 3000,
  },
  question: {
    fill: "#e6f7ff",
    edge: "#2c7da0",
    ink: "#12303e",
    chunk: 24,
    pause: 160,
    hold: 2600,
  },
  status: {
    fill: "#e6fffa",
    edge: "#0f766e",
    ink: "#113534",
    chunk: 26,
    pause: 180,
    hold: 3400,
  },
  alert: {
    fill: "#fdecec",
    edge: "#c2410c",
    ink: "#421b12",
    instant: true,
    chunk: 999,
    pause: 0,
    hold: 2400,
  },
  onboarding: {
    fill: "#f4f7d0",
    edge: "#5c7c2f",
    ink: "#23310d",
    chunk: 24,
    pause: 160,
    hold: 3200,
  },
  thought: {
    fill: "#eef3f8",
    edge: "#4b6478",
    ink: "#20303d",
    dashed: true,
    chunk: 20,
    pause: 140,
    hold: 1600,
  },
};

export const revealSteps = (text: string, { instant, chunk }: Bubble) => {
  if (instant || text.length <= chunk) return [text];
  const chunks: string[] = [];
  let current = "";
  for (const word of text.split(/\s+/)) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && candidate.length > chunk) {
      chunks.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);
  let visible = "";
  return chunks.map(
    (next) => (visible = visible ? `${visible} ${next}` : next),
  );
};

export const holdFor = (text: string, category: string) => {
  const words = Math.max(1, text.split(/\s+/).filter(Boolean).length);
  const lead = ["status", "onboarding"].includes(category) ? 600 : 0;
  const hold = BUBBLES[category].hold + Math.min(5000, words * 160) + lead;
  return Math.max(1400, Math.min(12000, hold));
};
