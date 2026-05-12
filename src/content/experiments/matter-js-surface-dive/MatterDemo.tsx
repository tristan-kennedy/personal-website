import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";

const {
  Bodies,
  Body,
  Composite,
  Composites,
  Constraint,
  Engine,
  Mouse,
  MouseConstraint,
  Render,
  Runner,
} = Matter;

type MatterDemoScenario = "gravity" | "collisions" | "constraints";

type MatterDemoProps = {
  scenario: MatterDemoScenario;
  height?: number;
};

const SCENE_META: Record<
  MatterDemoScenario,
  { label: string; description: string }
> = {
  gravity: {
    label: "SCENE 01",
    description:
      "Gravity and restitution in a small stream of mixed rigid bodies. Drag with your mouse to inspect body behavior.",
  },
  collisions: {
    label: "SCENE 02",
    description:
      "Stacked bodies + a moving projectile to show broad phase detection, narrow phase resolution, and restitution differences.",
  },
  constraints: {
    label: "SCENE 03",
    description:
      "A simple bridge made with constraints. Pull on the structure to feel how stiffness and damping affect motion.",
  },
};

export default function MatterDemo({
  scenario,
  height = 360,
}: MatterDemoProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (!hostRef.current) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const nextWidth = Math.floor(entries[0]?.contentRect.width ?? 0);
      if (nextWidth > 0) {
        setWidth(nextWidth);
      }
    });

    observer.observe(hostRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!stageRef.current || width <= 0) {
      return;
    }

    stageRef.current.innerHTML = "";

    const engine = Engine.create();
    const world = engine.world;
    const render = Render.create({
      element: stageRef.current,
      engine,
      options: {
        width,
        height,
        background: "transparent",
        wireframes: false,
        pixelRatio: window.devicePixelRatio,
      },
    });
    const runner = Runner.create();

    const wallSize = 120;
    const walls = [
      Bodies.rectangle(
        width / 2,
        -wallSize / 2,
        width + wallSize * 2,
        wallSize,
        {
          isStatic: true,
        },
      ),
      Bodies.rectangle(
        width / 2,
        height + wallSize / 2,
        width + wallSize * 2,
        wallSize,
        {
          isStatic: true,
        },
      ),
      Bodies.rectangle(
        -wallSize / 2,
        height / 2,
        wallSize,
        height + wallSize * 2,
        {
          isStatic: true,
        },
      ),
      Bodies.rectangle(
        width + wallSize / 2,
        height / 2,
        wallSize,
        height + wallSize * 2,
        {
          isStatic: true,
        },
      ),
    ];
    Composite.add(world, walls);

    const cleanupCallbacks: Array<() => void> = [];

    if (scenario === "gravity") {
      engine.gravity.y = 1;

      const spawnBody = (x?: number, y?: number) => {
        const body =
          Math.random() > 0.45
            ? Bodies.rectangle(
                x ?? 60 + Math.random() * (width - 120),
                y ?? -30,
                28 + Math.random() * 30,
                28 + Math.random() * 30,
                {
                  restitution: 0.5,
                  friction: 0.15,
                  render: { fillStyle: "#8d8d8d" },
                },
              )
            : Bodies.circle(
                x ?? 60 + Math.random() * (width - 120),
                y ?? -30,
                14 + Math.random() * 16,
                {
                  restitution: 0.82,
                  friction: 0.02,
                  render: { fillStyle: "#d62828" },
                },
              );

        Composite.add(world, body);
      };

      for (let index = 0; index < 12; index += 1) {
        spawnBody(80 + Math.random() * (width - 160), 20 + Math.random() * 80);
      }

      const spawnInterval = window.setInterval(() => {
        spawnBody();

        const dynamicBodies = Composite.allBodies(world).filter(
          (body) => !body.isStatic,
        );
        if (dynamicBodies.length > 56) {
          Composite.remove(world, dynamicBodies.slice(0, 8));
        }
      }, 900);

      cleanupCallbacks.push(() => window.clearInterval(spawnInterval));
    }

    if (scenario === "collisions") {
      engine.gravity.y = 0.95;

      const stack = Composites.stack(width * 0.48, 20, 6, 6, 4, 4, (x, y) =>
        Bodies.rectangle(x, y, 36, 36, {
          restitution: 0.1,
          friction: 0.7,
          density: 0.001,
          render: { fillStyle: "#8d8d8d" },
        }),
      );

      const ramp = Bodies.rectangle(width * 0.24, height * 0.74, 260, 18, {
        isStatic: true,
        angle: -0.36,
        render: { fillStyle: "#b0b0b0" },
      });

      const projectile = Bodies.circle(width * 0.14, height * 0.2, 26, {
        restitution: 0.88,
        friction: 0.01,
        density: 0.003,
        render: { fillStyle: "#d62828" },
      });

      Composite.add(world, [stack, ramp, projectile]);
      const launchTimeout = window.setTimeout(() => {
        Body.setVelocity(projectile, { x: 18, y: 2 });
      }, 500);

      cleanupCallbacks.push(() => window.clearTimeout(launchTimeout));
    }

    if (scenario === "constraints") {
      engine.gravity.y = 0.78;

      const group = Body.nextGroup(true);
      const bridge = Composites.stack(
        width * 0.2,
        height * 0.38,
        9,
        1,
        0,
        0,
        (x, y) =>
          Bodies.rectangle(x, y, 62, 20, {
            collisionFilter: { group },
            density: 0.0025,
            frictionAir: 0.03,
            render: { fillStyle: "#8d8d8d" },
          }),
      );

      Composites.chain(bridge, 0.3, 0, -0.3, 0, {
        stiffness: 0.95,
        length: 2,
        render: { visible: true },
      });

      const leftAnchor = Bodies.rectangle(width * 0.13, height * 0.38, 24, 24, {
        isStatic: true,
        render: { fillStyle: "#b0b0b0" },
      });
      const rightAnchor = Bodies.rectangle(
        width * 0.87,
        height * 0.38,
        24,
        24,
        {
          isStatic: true,
          render: { fillStyle: "#b0b0b0" },
        },
      );

      const leftConstraint = Constraint.create({
        bodyA: leftAnchor,
        bodyB: bridge.bodies[0],
        pointB: { x: -20, y: 0 },
        stiffness: 0.92,
      });
      const rightConstraint = Constraint.create({
        bodyA: rightAnchor,
        bodyB: bridge.bodies[bridge.bodies.length - 1],
        pointB: { x: 20, y: 0 },
        stiffness: 0.92,
      });

      const payload = Bodies.circle(width * 0.5, height * 0.12, 26, {
        restitution: 0.45,
        density: 0.004,
        render: { fillStyle: "#d62828" },
      });

      Composite.add(world, [
        bridge,
        leftAnchor,
        rightAnchor,
        leftConstraint,
        rightConstraint,
        payload,
      ]);
    }

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.24,
        render: { visible: false },
      },
    });
    Composite.add(world, mouseConstraint);
    render.mouse = mouse;

    Render.run(render);
    Runner.run(runner, engine);

    return () => {
      cleanupCallbacks.forEach((cleanup) => cleanup());
      Render.stop(render);
      Runner.stop(runner);
      Composite.clear(world, false);
      Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
      if (stageRef.current) {
        stageRef.current.innerHTML = "";
      }
    };
  }, [scenario, width, height, resetKey]);

  return (
    <section className="my-8">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h3 className="h2">{SCENE_META[scenario].label}</h3>
        <button
          type="button"
          onClick={() => setResetKey((value) => value + 1)}
          className="h2 transition-colors hover:text-accent"
        >
          RESET
        </button>
      </div>
      <div ref={hostRef} className="w-full bg-bg-elevated p-2 md:p-3">
        <div ref={stageRef} style={{ minHeight: `${height}px` }} />
      </div>
      <p className="mt-3 text-sm text-secondary">
        {SCENE_META[scenario].description}
      </p>
    </section>
  );
}
