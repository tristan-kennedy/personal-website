import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Point = {
  x: number;
  y: number;
};

type Segment = {
  id: string;
  a: Point;
  b: Point;
  draggable: boolean;
};

type DragState =
  | { kind: "none" }
  | {
      kind: "light";
      offset: Point;
    }
  | {
      kind: "wall";
      wallId: string;
      startPointer: Point;
      startA: Point;
      startB: Point;
    };

const VIEW_HEIGHT = 460;
const MIN_RAYS = 50;
const MAX_RAYS = 2000;
const DEFAULT_RAYS = 550;
const DRAG_MARGIN = 14;
const EPSILON = 1e-9;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

const subtract = (a: Point, b: Point): Point => ({
  x: a.x - b.x,
  y: a.y - b.y,
});

const cross = (a: Point, b: Point) => a.x * b.y - a.y * b.x;

const distanceToSegment = (point: Point, start: Point, end: Point) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared <= EPSILON) {
    return distance(point, start);
  }

  const projection =
    ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared;
  const t = clamp(projection, 0, 1);
  const nearest = { x: start.x + dx * t, y: start.y + dy * t };
  return distance(point, nearest);
};

const createDefaultLight = (width: number): Point => ({
  x: width * 0.26,
  y: VIEW_HEIGHT * 0.5,
});

const createDefaultWalls = (width: number): Segment[] => [
  {
    id: "wall-1",
    a: { x: width * 0.16, y: VIEW_HEIGHT * 0.2 },
    b: { x: width * 0.36, y: VIEW_HEIGHT * 0.16 },
    draggable: true,
  },
  {
    id: "wall-2",
    a: { x: width * 0.48, y: VIEW_HEIGHT * 0.17 },
    b: { x: width * 0.82, y: VIEW_HEIGHT * 0.29 },
    draggable: true,
  },
  {
    id: "wall-3",
    a: { x: width * 0.58, y: VIEW_HEIGHT * 0.45 },
    b: { x: width * 0.86, y: VIEW_HEIGHT * 0.5 },
    draggable: true,
  },
  {
    id: "wall-4",
    a: { x: width * 0.25, y: VIEW_HEIGHT * 0.61 },
    b: { x: width * 0.44, y: VIEW_HEIGHT * 0.8 },
    draggable: true,
  },
  {
    id: "wall-5",
    a: { x: width * 0.53, y: VIEW_HEIGHT * 0.69 },
    b: { x: width * 0.71, y: VIEW_HEIGHT * 0.88 },
    draggable: true,
  },
  {
    id: "wall-6",
    a: { x: width * 0.35, y: VIEW_HEIGHT * 0.34 },
    b: { x: width * 0.41, y: VIEW_HEIGHT * 0.56 },
    draggable: true,
  },
];

const createBoundaryWalls = (width: number): Segment[] => {
  const pad = 8;

  return [
    {
      id: "boundary-top",
      a: { x: pad, y: pad },
      b: { x: width - pad, y: pad },
      draggable: false,
    },
    {
      id: "boundary-right",
      a: { x: width - pad, y: pad },
      b: { x: width - pad, y: VIEW_HEIGHT - pad },
      draggable: false,
    },
    {
      id: "boundary-bottom",
      a: { x: width - pad, y: VIEW_HEIGHT - pad },
      b: { x: pad, y: VIEW_HEIGHT - pad },
      draggable: false,
    },
    {
      id: "boundary-left",
      a: { x: pad, y: VIEW_HEIGHT - pad },
      b: { x: pad, y: pad },
      draggable: false,
    },
  ];
};

const clampPointToScene = (point: Point, width: number): Point => ({
  x: clamp(point.x, DRAG_MARGIN, width - DRAG_MARGIN),
  y: clamp(point.y, DRAG_MARGIN, VIEW_HEIGHT - DRAG_MARGIN),
});

const fitSegmentInsideScene = (
  startA: Point,
  startB: Point,
  deltaX: number,
  deltaY: number,
  width: number,
) => {
  const nextA = { x: startA.x + deltaX, y: startA.y + deltaY };
  const nextB = { x: startB.x + deltaX, y: startB.y + deltaY };

  let adjustX = 0;
  let adjustY = 0;

  const minX = Math.min(nextA.x, nextB.x);
  const maxX = Math.max(nextA.x, nextB.x);
  const minY = Math.min(nextA.y, nextB.y);
  const maxY = Math.max(nextA.y, nextB.y);

  if (minX < DRAG_MARGIN) {
    adjustX += DRAG_MARGIN - minX;
  }
  if (maxX > width - DRAG_MARGIN) {
    adjustX -= maxX - (width - DRAG_MARGIN);
  }
  if (minY < DRAG_MARGIN) {
    adjustY += DRAG_MARGIN - minY;
  }
  if (maxY > VIEW_HEIGHT - DRAG_MARGIN) {
    adjustY -= maxY - (VIEW_HEIGHT - DRAG_MARGIN);
  }

  return {
    a: { x: nextA.x + adjustX, y: nextA.y + adjustY },
    b: { x: nextB.x + adjustX, y: nextB.y + adjustY },
  };
};

const intersectRayWithSegment = (
  origin: Point,
  direction: Point,
  segment: Segment,
  maxDistance: number,
) => {
  const rayStartToSegmentStart = subtract(segment.a, origin);
  const segmentDirection = subtract(segment.b, segment.a);
  const denominator = cross(direction, segmentDirection);

  if (Math.abs(denominator) <= EPSILON) {
    return null;
  }

  const rayT = cross(rayStartToSegmentStart, segmentDirection) / denominator;
  const segmentT = cross(rayStartToSegmentStart, direction) / denominator;

  if (rayT < 0 || segmentT < 0 || segmentT > 1) {
    return null;
  }

  const distanceAlongRay = Math.min(rayT, maxDistance);
  return {
    x: origin.x + direction.x * distanceAlongRay,
    y: origin.y + direction.y * distanceAlongRay,
  };
};

const castRays = (
  origin: Point,
  segments: Segment[],
  rayCount: number,
  maxDistance: number,
) => {
  const hits: Point[] = [];

  for (let index = 0; index < rayCount; index += 1) {
    const angle = (index / rayCount) * Math.PI * 2;
    const direction = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };

    let closest = {
      x: origin.x + direction.x * maxDistance,
      y: origin.y + direction.y * maxDistance,
    };
    let closestDistance = maxDistance * maxDistance;

    for (const segment of segments) {
      const intersection = intersectRayWithSegment(
        origin,
        direction,
        segment,
        maxDistance,
      );

      if (!intersection) {
        continue;
      }

      const deltaX = intersection.x - origin.x;
      const deltaY = intersection.y - origin.y;
      const distanceSquared = deltaX * deltaX + deltaY * deltaY;

      if (distanceSquared < closestDistance) {
        closestDistance = distanceSquared;
        closest = intersection;
      }
    }

    hits.push(closest);
  }

  return hits;
};

export default function RaycastingVisionDemo() {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [viewWidth, setViewWidth] = useState(0);
  const [light, setLight] = useState<Point>({ x: 0, y: 0 });
  const [walls, setWalls] = useState<Segment[]>([]);
  const [rayCount, setRayCount] = useState(DEFAULT_RAYS);
  const [showRays, setShowRays] = useState(true);
  const [hoveredWallId, setHoveredWallId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState>({ kind: "none" });
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!hostRef.current) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const nextWidth = Math.floor(entries[0]?.contentRect.width ?? 0);
      if (nextWidth > 220) {
        setViewWidth(nextWidth);
      }
    });

    observer.observe(hostRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (viewWidth <= 0) {
      return;
    }

    if (!initialized) {
      setLight(createDefaultLight(viewWidth));
      setWalls(createDefaultWalls(viewWidth));
      setInitialized(true);
      return;
    }

    setLight((previous) => clampPointToScene(previous, viewWidth));
    setWalls((previous) =>
      previous.map((segment) => {
        const fitted = fitSegmentInsideScene(
          segment.a,
          segment.b,
          0,
          0,
          viewWidth,
        );

        return {
          ...segment,
          a: fitted.a,
          b: fitted.b,
        };
      }),
    );
  }, [initialized, viewWidth]);

  const boundaryWalls = useMemo(
    () => (viewWidth > 0 ? createBoundaryWalls(viewWidth) : []),
    [viewWidth],
  );

  const allWalls = useMemo(
    () => [...boundaryWalls, ...walls],
    [boundaryWalls, walls],
  );

  const raycastResult = useMemo(() => {
    if (viewWidth <= 0) {
      return { hits: [], elapsedMs: 0 };
    }

    const maxDistance = Math.hypot(viewWidth, VIEW_HEIGHT) + 4;
    const startTime = typeof window !== "undefined" ? performance.now() : 0;
    const hits = castRays(light, allWalls, rayCount, maxDistance);
    const endTime = typeof window !== "undefined" ? performance.now() : 0;

    return {
      hits,
      elapsedMs: Math.max(0, endTime - startTime),
    };
  }, [allWalls, light, rayCount, viewWidth]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || viewWidth <= 0) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(viewWidth * dpr);
    canvas.height = Math.floor(VIEW_HEIGHT * dpr);
    canvas.style.width = `${viewWidth}px`;
    canvas.style.height = `${VIEW_HEIGHT}px`;

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, viewWidth, VIEW_HEIGHT);

    context.fillStyle = "#090e13";
    context.fillRect(0, 0, viewWidth, VIEW_HEIGHT);

    if (raycastResult.hits.length > 2) {
      context.beginPath();
      context.moveTo(raycastResult.hits[0].x, raycastResult.hits[0].y);

      for (let index = 1; index < raycastResult.hits.length; index += 1) {
        context.lineTo(
          raycastResult.hits[index].x,
          raycastResult.hits[index].y,
        );
      }

      context.closePath();
      context.fillStyle = "rgba(100, 220, 255, 0.22)";
      context.fill();
    }

    if (showRays) {
      context.strokeStyle = "rgba(147, 197, 253, 0.14)";
      context.lineWidth = 1;

      for (const hit of raycastResult.hits) {
        context.beginPath();
        context.moveTo(light.x, light.y);
        context.lineTo(hit.x, hit.y);
        context.stroke();
      }
    }

    for (const segment of boundaryWalls) {
      context.beginPath();
      context.moveTo(segment.a.x, segment.a.y);
      context.lineTo(segment.b.x, segment.b.y);
      context.strokeStyle = "rgba(226, 232, 240, 0.42)";
      context.lineWidth = 1;
      context.stroke();
    }

    for (const segment of walls) {
      const isActive =
        hoveredWallId === segment.id ||
        (dragState.kind === "wall" && dragState.wallId === segment.id);

      context.beginPath();
      context.moveTo(segment.a.x, segment.a.y);
      context.lineTo(segment.b.x, segment.b.y);
      context.strokeStyle = isActive ? "#f97316" : "#d8e1ec";
      context.lineWidth = 2;
      context.stroke();

      const midpoint = {
        x: (segment.a.x + segment.b.x) / 2,
        y: (segment.a.y + segment.b.y) / 2,
      };

      context.beginPath();
      context.arc(midpoint.x, midpoint.y, 3, 0, Math.PI * 2);
      context.fillStyle = isActive ? "#f97316" : "#9fb0c4";
      context.fill();
    }

    context.beginPath();
    context.arc(light.x, light.y, 8, 0, Math.PI * 2);
    context.fillStyle = "#fef08a";
    context.fill();

    context.beginPath();
    context.arc(light.x, light.y, 15, 0, Math.PI * 2);
    context.strokeStyle = "rgba(254, 240, 138, 0.45)";
    context.lineWidth = 1.5;
    context.stroke();
  }, [
    boundaryWalls,
    dragState,
    hoveredWallId,
    light,
    raycastResult.hits,
    showRays,
    viewWidth,
    walls,
  ]);

  const getPointer = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>): Point => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * viewWidth;
      const y = ((event.clientY - rect.top) / rect.height) * VIEW_HEIGHT;
      return { x, y };
    },
    [viewWidth],
  );

  const findNearestWall = useCallback(
    (point: Point) => {
      let bestMatch: { id: string; distance: number } | null = null;

      for (const wall of walls) {
        const wallDistance = distanceToSegment(point, wall.a, wall.b);
        if (wallDistance > 10) {
          continue;
        }

        if (!bestMatch || wallDistance < bestMatch.distance) {
          bestMatch = { id: wall.id, distance: wallDistance };
        }
      }

      return bestMatch?.id ?? null;
    },
    [walls],
  );

  const resetScene = useCallback(() => {
    if (viewWidth <= 0) {
      return;
    }

    setLight(createDefaultLight(viewWidth));
    setWalls(createDefaultWalls(viewWidth));
    setHoveredWallId(null);
    setDragState({ kind: "none" });
    setRayCount(DEFAULT_RAYS);
    setShowRays(true);
  }, [viewWidth]);

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (viewWidth <= 0) {
      return;
    }

    const point = getPointer(event);

    if (distance(point, light) <= 16) {
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragState({
        kind: "light",
        offset: {
          x: point.x - light.x,
          y: point.y - light.y,
        },
      });
      return;
    }

    const wallId = findNearestWall(point);
    if (!wallId) {
      return;
    }

    const selected = walls.find((wall) => wall.id === wallId);
    if (!selected) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    setDragState({
      kind: "wall",
      wallId,
      startPointer: point,
      startA: selected.a,
      startB: selected.b,
    });
    setHoveredWallId(wallId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (viewWidth <= 0) {
      return;
    }

    const point = getPointer(event);

    if (dragState.kind === "light") {
      setLight(
        clampPointToScene(
          {
            x: point.x - dragState.offset.x,
            y: point.y - dragState.offset.y,
          },
          viewWidth,
        ),
      );
      return;
    }

    if (dragState.kind === "wall") {
      const deltaX = point.x - dragState.startPointer.x;
      const deltaY = point.y - dragState.startPointer.y;

      setWalls((previous) =>
        previous.map((wall) => {
          if (wall.id !== dragState.wallId) {
            return wall;
          }

          const moved = fitSegmentInsideScene(
            dragState.startA,
            dragState.startB,
            deltaX,
            deltaY,
            viewWidth,
          );

          return {
            ...wall,
            a: moved.a,
            b: moved.b,
          };
        }),
      );
      return;
    }

    setHoveredWallId(findNearestWall(point));
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragState({ kind: "none" });
  };

  return (
    <section className="my-10 bg-[#090e13] p-4 text-[#d6deea] md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.2rem] text-[#8c98ab]">
            LIVE DEBUG VIEW
          </p>
          <p className="mt-2 text-sm text-[#b4c0d2]">
            Drag the light source or any wall segment to update line-of-sight.
          </p>
        </div>
        <button
          type="button"
          onClick={resetScene}
          className="text-xs tracking-[0.2rem] text-[#d6deea] transition-colors hover:text-[#f97316]"
        >
          RESET SCENE
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-10 md:items-end md:gap-x-6">
        <div className="md:col-start-1 md:col-end-8">
          <label
            htmlFor="ray-count"
            className="text-xs tracking-[0.2rem] text-[#8c98ab]"
          >
            RAY COUNT: {rayCount.toLocaleString()}
          </label>
          <input
            id="ray-count"
            type="range"
            min={MIN_RAYS}
            max={MAX_RAYS}
            step={10}
            value={rayCount}
            onChange={(event) => setRayCount(Number(event.target.value))}
            className="mt-2 w-full accent-[#60a5fa]"
          />
        </div>

        <label className="flex items-center gap-2 text-xs tracking-[0.2rem] text-[#d6deea] md:col-start-8 md:col-end-11 md:justify-end">
          <input
            type="checkbox"
            checked={showRays}
            onChange={(event) => setShowRays(event.target.checked)}
            className="h-4 w-4 accent-[#60a5fa]"
          />
          SHOW RAYS
        </label>
      </div>

      <div ref={hostRef} className="mt-4 w-full">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={() => {
            if (dragState.kind === "none") {
              setHoveredWallId(null);
            }
          }}
          style={{ touchAction: "none" }}
          className="block w-full"
          aria-label="2D raycasting vision simulator canvas"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-[#8c98ab]">
        <p>
          Visible polygon points: {raycastResult.hits.length.toLocaleString()}
        </p>
        <p>Raycast pass: {raycastResult.elapsedMs.toFixed(2)} ms</p>
      </div>
    </section>
  );
}
