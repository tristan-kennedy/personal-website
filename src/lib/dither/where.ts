import { geoOrthographic } from "d3-geo";
import { moves } from "../site.ts";

export const MAP_WIDTH = 400;
export const MAP_HEIGHT = 210;
export const PHONE_MAP_WIDTH = 160;
export const PHONE_MAP_HEIGHT = 124;

type Coordinates = { lat: number; lon: number };
type Point = [number, number];

export const mapProjection = () =>
  geoOrthographic()
    .rotate([86.4, -38])
    .scale(MAP_WIDTH * 1.55)
    .translate([MAP_WIDTH * 0.6, MAP_HEIGHT / 2]);

export const phoneMapProjection = () =>
  geoOrthographic()
    .rotate([86, -37])
    .fitExtent(
      [
        [4, 4],
        [PHONE_MAP_WIDTH - 4, PHONE_MAP_HEIGHT - 4],
      ],
      {
        type: "MultiPoint",
        coordinates: [
          ...moves.map(({ coordinates: { lat, lon } }) => [lon, lat]),
          [-98, 25.5],
          [-80.5, 25],
          [-71, 44.5],
        ],
      },
    );

export function flightPath(stops: Coordinates[], projection = mapProjection()) {
  const points = stops.map(({ lat, lon }) => projection([lon, lat]) as Point);
  const path: Point[] = [points[0].map(Math.round) as Point];
  const arrivals = [0];
  for (let leg = 1; leg < points.length; leg++) {
    const [ax, ay] = points[leg - 1];
    const [bx, by] = points[leg];
    const length = Math.hypot(bx - ax, by - ay);
    const cx = (ax + bx) / 2 + (by - ay) * 0.14;
    const cy = (ay + by) / 2 - (bx - ax) * 0.14;
    const steps = Math.ceil(length * 3);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const x = Math.round(
        (1 - t) ** 2 * ax + 2 * (1 - t) * t * cx + t * t * bx,
      );
      const y = Math.round(
        (1 - t) ** 2 * ay + 2 * (1 - t) * t * cy + t * t * by,
      );
      const [lx, ly] = path[path.length - 1];
      if (x !== lx || y !== ly) path.push([x, y]);
    }
    arrivals.push(path.length - 1);
  }
  return { path, arrivals };
}
