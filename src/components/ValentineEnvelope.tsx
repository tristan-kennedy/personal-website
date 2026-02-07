import React, { useEffect, useRef, useState } from "react";
import { Engine, Bodies, Composite, Body, Constraint } from "matter-js";
import confetti from "canvas-confetti";

const BASE_WIDTH = 520;
const BASE_HEIGHT = 340;
const WALL_THICKNESS = 200;
const CONFETTI_Z_INDEX = 1000;
const SEAL_DRAG_THRESHOLD = 10;

type DragTarget = "envelope" | "note";
type AudioContextConstructor = new () => AudioContext;

const getEnvelopeSize = (bounds: DOMRect) => {
  const scale = Math.min(
    1.15,
    (bounds.width * 0.92) / BASE_WIDTH,
    (bounds.height * 0.82) / BASE_HEIGHT,
  );
  const width = Math.round(BASE_WIDTH * scale);
  const height = Math.round(BASE_HEIGHT * scale);
  const noteSize = Math.round(Math.min(width * 0.8, height * 0.88));
  return {
    width,
    height,
    noteWidth: noteSize,
    noteHeight: noteSize,
  };
};

const ValentineEnvelope = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const envelopeRef = useRef<HTMLDivElement | null>(null);
  const noteRef = useRef<HTMLDivElement | null>(null);

  const engineRef = useRef<Engine | null>(null);
  const envelopeBodyRef = useRef<Body | null>(null);
  const noteBodyRef = useRef<Body | null>(null);
  const dragConstraintRef = useRef<Constraint | null>(null);
  const dragTargetRef = useRef<DragTarget | null>(null);
  const dragPointerIdRef = useRef<number | null>(null);
  const sealPressRef = useRef<{ id: number; x: number; y: number } | null>(
    null,
  );

  const sizeRef = useRef({
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
    noteWidth: 360,
    noteHeight: 220,
  });

  const boundsRef = useRef({ width: 0, height: 0 });

  const openedRef = useRef(false);
  const noteReleasedRef = useRef(false);
  const gravityEnabledRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const [opened, setOpened] = useState(false);
  const [noteReleased, setNoteReleased] = useState(false);
  const [overlay, setOverlay] = useState<"yes" | "no" | null>(null);

  useEffect(() => {
    if (!containerRef.current || !envelopeRef.current || !noteRef.current) {
      return undefined;
    }

    const engine = Engine.create();
    engine.gravity.y = 0;
    engineRef.current = engine;

    const container = containerRef.current;
    const bounds = container.getBoundingClientRect();
    boundsRef.current = { width: bounds.width, height: bounds.height };
    const size = getEnvelopeSize(bounds);
    sizeRef.current = size;

    envelopeRef.current.style.width = `${size.width}px`;
    envelopeRef.current.style.height = `${size.height}px`;
    noteRef.current.style.width = `${size.noteWidth}px`;
    noteRef.current.style.height = `${size.noteHeight}px`;

    const envelopeBody = Bodies.rectangle(
      bounds.width / 2,
      bounds.height * 0.35,
      size.width,
      size.height,
      {
        frictionAir: 0.03,
        friction: 0.2,
        restitution: 0.05,
      },
    );
    envelopeBodyRef.current = envelopeBody;

    const noteBody = Bodies.rectangle(0, 0, size.noteWidth, size.noteHeight, {
      frictionAir: 0.03,
      friction: 0.25,
      restitution: 0.02,
    });
    noteBody.isSensor = true;
    noteBodyRef.current = noteBody;

    const wallOffset = WALL_THICKNESS / 2;
    const ground = Bodies.rectangle(
      bounds.width / 2,
      bounds.height + wallOffset,
      bounds.width + WALL_THICKNESS * 2,
      WALL_THICKNESS,
      { isStatic: true },
    );
    const ceiling = Bodies.rectangle(
      bounds.width / 2,
      -wallOffset,
      bounds.width + WALL_THICKNESS * 2,
      WALL_THICKNESS,
      { isStatic: true },
    );
    const leftWall = Bodies.rectangle(
      -wallOffset,
      bounds.height / 2,
      WALL_THICKNESS,
      bounds.height + WALL_THICKNESS * 2,
      { isStatic: true },
    );
    const rightWall = Bodies.rectangle(
      bounds.width + wallOffset,
      bounds.height / 2,
      WALL_THICKNESS,
      bounds.height + WALL_THICKNESS * 2,
      { isStatic: true },
    );
    Composite.add(engine.world, [
      envelopeBody,
      ground,
      ceiling,
      leftWall,
      rightWall,
    ]);

    let animationFrame = 0;
    let lastTime = performance.now();
    const tick = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      Engine.update(engine, delta);

      if (envelopeRef.current && envelopeBodyRef.current) {
        const { x, y } = envelopeBodyRef.current.position;
        const angle = envelopeBodyRef.current.angle;
        const { width, height } = sizeRef.current;
        envelopeRef.current.style.transform = `translate(${x - width / 2}px, ${y - height / 2}px) rotate(${angle}rad)`;
      }

      if (noteReleasedRef.current && noteRef.current && noteBodyRef.current) {
        const { x, y } = noteBodyRef.current.position;
        const angle = noteBodyRef.current.angle;
        const { noteWidth, noteHeight } = sizeRef.current;
        noteRef.current.style.transform = `translate(${x - noteWidth / 2}px, ${y - noteHeight / 2}px) rotate(${angle}rad)`;
      }

      animationFrame = window.requestAnimationFrame(tick);
    };
    animationFrame = window.requestAnimationFrame(tick);

    const handleResize = () => {
      if (!containerRef.current || !envelopeRef.current || !noteRef.current) {
        return;
      }
      const nextBounds = containerRef.current.getBoundingClientRect();
      const prevBounds = boundsRef.current;
      const scaleX = prevBounds.width ? nextBounds.width / prevBounds.width : 1;
      const scaleY = prevBounds.height
        ? nextBounds.height / prevBounds.height
        : 1;
      boundsRef.current = {
        width: nextBounds.width,
        height: nextBounds.height,
      };
      const prevSize = sizeRef.current;
      const nextSize = getEnvelopeSize(nextBounds);
      sizeRef.current = nextSize;

      if (envelopeBodyRef.current) {
        const scaleX = nextSize.width / prevSize.width;
        const scaleY = nextSize.height / prevSize.height;
        Body.scale(envelopeBodyRef.current, scaleX, scaleY);
      }

      if (noteBodyRef.current) {
        const scaleX = nextSize.noteWidth / prevSize.noteWidth;
        const scaleY = nextSize.noteHeight / prevSize.noteHeight;
        Body.scale(noteBodyRef.current, scaleX, scaleY);
      }

      envelopeRef.current.style.width = `${nextSize.width}px`;
      envelopeRef.current.style.height = `${nextSize.height}px`;
      noteRef.current.style.width = `${nextSize.noteWidth}px`;
      noteRef.current.style.height = `${nextSize.noteHeight}px`;

      Body.scale(ground, scaleX, 1);
      Body.scale(ceiling, scaleX, 1);
      Body.scale(leftWall, 1, scaleY);
      Body.scale(rightWall, 1, scaleY);

      const nextWallOffset = WALL_THICKNESS / 2;
      Body.setPosition(ground, {
        x: nextBounds.width / 2,
        y: nextBounds.height + nextWallOffset,
      });
      Body.setPosition(ceiling, {
        x: nextBounds.width / 2,
        y: -nextWallOffset,
      });
      Body.setPosition(leftWall, {
        x: -nextWallOffset,
        y: nextBounds.height / 2,
      });
      Body.setPosition(rightWall, {
        x: nextBounds.width + nextWallOffset,
        y: nextBounds.height / 2,
      });
      if (!openedRef.current && envelopeBodyRef.current) {
        Body.setPosition(envelopeBodyRef.current, {
          x: nextBounds.width / 2,
          y: nextBounds.height * 0.35,
        });
        Body.setVelocity(envelopeBodyRef.current, { x: 0, y: 0 });
        Body.setAngularVelocity(envelopeBodyRef.current, 0);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.cancelAnimationFrame(animationFrame);
      Engine.clear(engine);
    };
  }, []);

  useEffect(() => {
    openedRef.current = opened;
  }, [opened]);

  const enableGravity = () => {
    if (!gravityEnabledRef.current && engineRef.current) {
      engineRef.current.gravity.y = 1.35;
      engineRef.current.gravity.scale = 0.0013;
      gravityEnabledRef.current = true;
    }
  };

  const getAudioContext = () => {
    if (typeof window === "undefined") {
      return null;
    }
    const AudioContextCtor =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: AudioContextConstructor })
        .webkitAudioContext;
    if (!AudioContextCtor) {
      return null;
    }
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextCtor();
    }
    if (audioContextRef.current.state === "suspended") {
      void audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  const releaseNote = () => {
    if (
      noteReleasedRef.current ||
      !engineRef.current ||
      !envelopeBodyRef.current ||
      !noteBodyRef.current
    ) {
      return;
    }
    noteReleasedRef.current = true;
    setNoteReleased(true);

    const { height } = sizeRef.current;
    const offsetY = height * 0.08;
    const cos = Math.cos(envelopeBodyRef.current.angle);
    const sin = Math.sin(envelopeBodyRef.current.angle);

    const x = envelopeBodyRef.current.position.x + 0 * cos - offsetY * sin;
    const y = envelopeBodyRef.current.position.y + 0 * sin + offsetY * cos;

    Body.setPosition(noteBodyRef.current, { x, y });
    Body.setAngle(noteBodyRef.current, (Math.random() - 0.5) * 0.08);
    Body.setVelocity(noteBodyRef.current, { x: 0, y: 0 });
    Body.setAngularVelocity(noteBodyRef.current, 0);
    noteBodyRef.current.isSensor = false;
    Composite.add(engineRef.current.world, [noteBodyRef.current]);
  };

  const beginDrag = (
    body: Body,
    target: DragTarget,
    event: React.PointerEvent<HTMLElement>,
  ) => {
    if (!engineRef.current || !containerRef.current) {
      return;
    }
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }
    if (dragConstraintRef.current) {
      return;
    }
    event.preventDefault();
    enableGravity();

    const rect = containerRef.current.getBoundingClientRect();
    const point = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    const dx = point.x - body.position.x;
    const dy = point.y - body.position.y;
    const cos = Math.cos(-body.angle);
    const sin = Math.sin(-body.angle);
    const local = {
      x: dx * cos - dy * sin,
      y: dx * sin + dy * cos,
    };

    const constraint = Constraint.create({
      pointA: point,
      bodyB: body,
      pointB: local,
      stiffness: 0.42,
      damping: 0.25,
      length: 0,
    });

    Composite.add(engineRef.current.world, constraint);
    dragConstraintRef.current = constraint;
    dragTargetRef.current = target;
    dragPointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);

    if (target === "envelope") {
      envelopeRef.current?.classList.add("is-dragging");
    }
    if (target === "note") {
      noteRef.current?.classList.add("is-dragging");
    }
  };

  const moveDrag = (event: React.PointerEvent<HTMLElement>) => {
    if (
      !dragConstraintRef.current ||
      dragPointerIdRef.current !== event.pointerId ||
      !containerRef.current
    ) {
      return;
    }
    if (sealPressRef.current?.id === event.pointerId) {
      const dx = event.clientX - sealPressRef.current.x;
      const dy = event.clientY - sealPressRef.current.y;
      if (dx * dx + dy * dy > SEAL_DRAG_THRESHOLD * SEAL_DRAG_THRESHOLD) {
        sealPressRef.current = null;
      }
    }
    const rect = containerRef.current.getBoundingClientRect();
    dragConstraintRef.current.pointA = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const openEnvelope = () => {
    if (openedRef.current) {
      return;
    }
    setOpened(true);
    openedRef.current = true;
    envelopeRef.current?.classList.add("is-open");
    releaseNote();
  };

  const endDrag = (event: React.PointerEvent<HTMLElement>) => {
    const shouldOpenFromSeal = sealPressRef.current?.id === event.pointerId;
    if (sealPressRef.current?.id === event.pointerId) {
      sealPressRef.current = null;
    }
    if (
      !dragConstraintRef.current ||
      dragPointerIdRef.current !== event.pointerId ||
      !engineRef.current
    ) {
      if (shouldOpenFromSeal) {
        openEnvelope();
      }
      return;
    }
    event.currentTarget.releasePointerCapture(event.pointerId);
    Composite.remove(engineRef.current.world, dragConstraintRef.current);
    dragConstraintRef.current = null;
    dragTargetRef.current = null;
    dragPointerIdRef.current = null;

    envelopeRef.current?.classList.remove("is-dragging");
    noteRef.current?.classList.remove("is-dragging");

    if (shouldOpenFromSeal) {
      openEnvelope();
    }
  };

  const fireHearts = () => {
    if (typeof window === "undefined") {
      return;
    }
    const confettiWithShape = confetti as typeof confetti & {
      shapeFromPath?: (options: { path: string; matrix?: number[] }) => unknown;
    };
    const heart = confettiWithShape.shapeFromPath
      ? confettiWithShape.shapeFromPath({
          path: "M0 3.5C0 1.5 1.5 0 3.5 0C4.9 0 6.1 0.8 6.7 2C7.3 0.8 8.5 0 9.9 0C11.9 0 13.4 1.5 13.4 3.5C13.4 6.1 10.2 8.7 6.7 12C3.2 8.7 0 6.1 0 3.5Z",
          matrix: [0.09, 0, 0, 0.09, 0, 0],
        })
      : "circle";
    const colors = ["#ff6b81", "#ff99aa", "#ffd1dc", "#ffe3ea", "#ffc3d4"];
    const burst = (particleCount: number, origin: { x: number; y: number }) =>
      confetti({
        particleCount,
        spread: 360,
        startVelocity: 100,
        scalar: 20,
        gravity: 0.85,
        ticks: 200,
        shapes: [heart],
        colors,
        origin,
        zIndex: CONFETTI_Z_INDEX,
      });

    burst(240, { x: 0.5, y: 0.45 });
    window.setTimeout(() => burst(160, { x: 0.3, y: 0.5 }), 140);
    window.setTimeout(() => burst(160, { x: 0.7, y: 0.5 }), 200);
    window.setTimeout(() => burst(140, { x: 0.5, y: 0.62 }), 320);

    const end = Date.now() + 900;
    const frame = () => {
      confetti({
        particleCount: 8,
        spread: 80,
        startVelocity: 26,
        scalar: 1.1,
        gravity: 0.9,
        ticks: 180,
        shapes: [heart],
        colors,
        origin: { x: 0.5, y: 0.45 },
        zIndex: CONFETTI_Z_INDEX,
      });
      if (Date.now() < end) {
        window.requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const playYay = () => {
    const context = getAudioContext();
    if (!context) {
      return;
    }
    const now = context.currentTime;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    gain.connect(context.destination);

    const freqs = [392, 494, 659];
    freqs.forEach((freq, index) => {
      const osc = context.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq * 0.92, now + index * 0.02);
      osc.frequency.exponentialRampToValueAtTime(
        freq * 1.18,
        now + 0.32 + index * 0.02,
      );
      osc.connect(gain);
      osc.start(now + index * 0.02);
      osc.stop(now + 0.85);
    });
  };

  const playSad = () => {
    const context = getAudioContext();
    if (!context) {
      return;
    }
    const now = context.currentTime;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1200, now);
    filter.connect(gain);
    gain.connect(context.destination);

    const osc = context.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(178, now + 1.2);

    const vibrato = context.createOscillator();
    vibrato.type = "sine";
    vibrato.frequency.setValueAtTime(5, now);
    const vibratoGain = context.createGain();
    vibratoGain.gain.setValueAtTime(6, now);
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);

    osc.connect(filter);
    osc.start(now);
    vibrato.start(now);
    osc.stop(now + 1.6);
    vibrato.stop(now + 1.6);
  };

  const fireEmbers = () => {
    if (typeof window === "undefined") {
      return;
    }
    const ashColors = [
      "#1a0b0d",
      "#3a1116",
      "#5f161b",
      "#8b1c22",
      "#d9483b",
      "#ff6b3d",
    ];
    const burst = (particleCount: number, origin: { x: number; y: number }) =>
      confetti({
        particleCount,
        spread: 70,
        startVelocity: 48,
        scalar: 0.7,
        gravity: 1.25,
        ticks: 220,
        decay: 0.88,
        shapes: ["square"],
        colors: ashColors,
        origin,
        zIndex: CONFETTI_Z_INDEX,
      });

    burst(180, { x: 0.5, y: 0.75 });
    window.setTimeout(() => burst(120, { x: 0.35, y: 0.8 }), 120);
    window.setTimeout(() => burst(120, { x: 0.65, y: 0.8 }), 220);
  };

  const handleYes = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setOverlay("yes");
    fireHearts();
    playYay();
  };

  const handleNo = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setOverlay("no");
    fireEmbers();
    playSad();
  };

  return (
    <>
      <div className="valentine-envelope" ref={containerRef}>
        <div
          className={`valentine-envelope-shell ${opened ? "is-open" : ""}`}
          ref={envelopeRef}
          onPointerDown={(event) => {
            if (!envelopeBodyRef.current) {
              return;
            }
            beginDrag(envelopeBodyRef.current, "envelope", event);
          }}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div className="valentine-envelope-body">
            <div className="valentine-envelope-back" />
            <div className="valentine-envelope-front" />
          </div>
          <div
            className="valentine-seal"
            role="button"
            aria-label="Open the envelope"
            onPointerDown={(event) => {
              sealPressRef.current = {
                id: event.pointerId,
                x: event.clientX,
                y: event.clientY,
              };
            }}
          >
            <span className="valentine-seal-text">Tap</span>
          </div>
        </div>

        <div
          className={`valentine-note ${noteReleased ? "is-visible" : ""}`}
          ref={noteRef}
          onPointerDown={(event) => {
            if (!noteReleased || !noteBodyRef.current) {
              return;
            }
            if ((event.target as HTMLElement).closest("[data-note-action]")) {
              return;
            }
            beginDrag(noteBodyRef.current, "note", event);
          }}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <p>Hey Trinity,</p>
          <p>
            I want you to know I love you so much, will you be my valentine?
          </p>
          <div className="valentine-note-actions">
            <button
              className="valentine-note-yes"
              type="button"
              data-note-action
              onClick={handleYes}
              onPointerDown={(event) => event.stopPropagation()}
            >
              Yes
            </button>
            <button
              className="valentine-note-no"
              type="button"
              data-note-action
              onClick={handleNo}
              onPointerDown={(event) => event.stopPropagation()}
            >
              No
            </button>
          </div>
        </div>

        <div className="valentine-instructions">
          Grab the envelope to release gravity. Tap the seal to open. Drag the
          note.
        </div>
      </div>

      <div
        className={`valentine-overlay ${overlay ? "is-visible" : ""}`}
        aria-hidden={!overlay}
      >
        <div className="valentine-overlay-scrim" />
        {overlay === "yes" && (
          <img
            className="valentine-overlay-gif"
            src="https://media1.tenor.com/m/Y5UaEgPF-kwAAAAC/love-kiss.gif"
            alt="Celebration"
          />
        )}
        {overlay === "no" && (
          <img
            className="valentine-overlay-gif"
            src="https://media1.tenor.com/m/O4TFmBT4OwYAAAAC/sad-sad-cat.gif"
            alt="Sad"
          />
        )}
      </div>
    </>
  );
};

export default ValentineEnvelope;
