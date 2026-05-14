import { useMemo, useState } from "react";

type MdxFeatureMode = "counter" | "transform" | "registry";

type MdxFeatureDemoProps = {
  mode: MdxFeatureMode;
};

type RegistryTone = "note" | "warning" | "success";

const TONE_COPY: Record<RegistryTone, { title: string; body: string }> = {
  note: {
    title: "Implementation Note",
    body: "This block is chosen from a typed component registry and rendered dynamically.",
  },
  warning: {
    title: "Typed Guardrail",
    body: "If you pick an invalid tone key, TypeScript fails before content ships.",
  },
  success: {
    title: "Composable Win",
    body: "MDX can orchestrate reusable UI primitives while staying content-first.",
  },
};

const defaultText =
  "MDX can render markdown, components, and interactive React islands in one file.";

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const wordCount = (value: string) =>
  value.trim().split(/\s+/).filter(Boolean).length;

export default function MdxFeatureDemo({ mode }: MdxFeatureDemoProps) {
  const [count, setCount] = useState(3);
  const [step, setStep] = useState(2);
  const [text, setText] = useState(defaultText);
  const [tone, setTone] = useState<RegistryTone>("note");

  const metrics = useMemo(() => {
    const words = wordCount(text);
    const chars = text.length;
    const readingSeconds = Math.max(5, Math.round((words / 220) * 60));
    return {
      words,
      chars,
      slug: toSlug(text),
      readingSeconds,
    };
  }, [text]);

  if (mode === "counter") {
    return (
      <section className="my-8 bg-bg-elevated p-4 md:p-6">
        <h3 className="mb-3 text-xs tracking-[0.2rem] text-secondary">
          TSX COUNTER IN MDX
        </h3>
        <p className="mb-4 text-sm text-secondary">
          This is a React island embedded directly inside MDX.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-10 md:gap-x-6">
          <div className="md:col-start-1 md:col-end-5">
            <p className="text-5xl leading-none tracking-tight">{count}</p>
            <p className="mt-2 text-sm text-secondary">Current value</p>
          </div>
          <div className="flex flex-wrap gap-2 md:col-start-5 md:col-end-11 md:justify-end">
            <button
              type="button"
              onClick={() => setCount((value) => value - step)}
              className="bg-bg px-3 py-2 text-xs tracking-[0.2rem] text-primary transition-colors hover:text-accent"
            >
              - STEP
            </button>
            <button
              type="button"
              onClick={() => setCount((value) => value + step)}
              className="bg-bg px-3 py-2 text-xs tracking-[0.2rem] text-primary transition-colors hover:text-accent"
            >
              + STEP
            </button>
            <button
              type="button"
              onClick={() => setCount(0)}
              className="bg-bg px-3 py-2 text-xs tracking-[0.2rem] text-primary transition-colors hover:text-accent"
            >
              RESET
            </button>
          </div>
        </div>
        <label
          className="mt-5 block text-sm text-secondary"
          htmlFor="counter-step"
        >
          Step size: {step}
        </label>
        <input
          id="counter-step"
          type="range"
          min={1}
          max={12}
          value={step}
          onChange={(event) => setStep(Number(event.target.value))}
          className="mt-2 w-full accent-accent"
        />
      </section>
    );
  }

  if (mode === "transform") {
    return (
      <section className="my-8 bg-bg-elevated p-4 md:p-6">
        <h3 className="mb-3 text-xs tracking-[0.2rem] text-secondary">
          TYPESCRIPT TRANSFORM IN MDX
        </h3>
        <p className="mb-4 text-sm text-secondary">
          Typed utility functions update this output live as input changes.
        </p>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="min-h-[128px] w-full resize-y bg-bg p-3 text-sm text-primary"
        />
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
          <div className="bg-bg p-3">
            <p className="mb-2 text-xs tracking-[0.2rem] text-secondary">
              WORDS
            </p>
            <p>{metrics.words}</p>
          </div>
          <div className="bg-bg p-3">
            <p className="mb-2 text-xs tracking-[0.2rem] text-secondary">
              CHARS
            </p>
            <p>{metrics.chars}</p>
          </div>
          <div className="bg-bg p-3">
            <p className="mb-2 text-xs tracking-[0.2rem] text-secondary">
              READING
            </p>
            <p>{metrics.readingSeconds}s</p>
          </div>
        </div>
        <div className="mt-3 bg-bg p-3">
          <p className="mb-2 text-xs tracking-[0.2rem] text-secondary">SLUG</p>
          <p className="text-sm break-all text-secondary">
            {metrics.slug || "(empty)"}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="my-8 bg-bg-elevated p-4 md:p-6">
      <h3 className="mb-3 text-xs tracking-[0.2rem] text-secondary">
        COMPONENT REGISTRY PATTERN
      </h3>
      <p className="mb-4 text-sm text-secondary">
        MDX can switch between UI variants using typed keys from frontmatter or
        props.
      </p>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(TONE_COPY) as RegistryTone[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setTone(option)}
            className={`px-3 py-2 text-xs tracking-[0.2rem] transition-colors ${
              tone === option
                ? "bg-accent text-white"
                : "bg-bg text-primary hover:text-accent"
            }`}
          >
            {option.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="mt-4 bg-bg p-4">
        <p className="mb-2 text-xs tracking-[0.2rem] text-secondary">
          {TONE_COPY[tone].title}
        </p>
        <p>{TONE_COPY[tone].body}</p>
      </div>
    </section>
  );
}
