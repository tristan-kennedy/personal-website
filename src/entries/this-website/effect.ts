import { packed, plotter, type Effect } from "../../lib/dither/effect";
import { threshold } from "../../lib/dither/index";
import { MUTED, PAPER } from "../../lib/dither/palette";

const STEEL = packed(PAPER);
const POLE = packed(MUTED);
const CAUTION = packed([0xff, 0xc9, 0x3c]);
const SKETCH_HEIGHT = 88;

export default {
  reach: { top: 1.5, right: 0.4, bottom: 0.32, left: 0.4 },
  paint(stage) {
    const { cols, rows, box } = stage;
    const wide = box.right - box.left;
    const scale = Math.min(box.top / SKETCH_HEIGHT, wide / 150);
    const base = Math.round(box.top + (box.bottom - box.top) * 0.45);
    const mast = box.left + wide * 0.3;
    const mastTall = 54 * scale;
    const jib = Math.min(wide * 0.56, 96 * scale);
    const counter = 22 * scale;

    return (pixels, seconds, reveal) => {
      const put = plotter(stage, pixels, reveal);
      const risen = Math.min(1, reveal / 0.6);
      const lift = (1 - risen) * 34 * scale;
      const stand = (x: number, y: number, ink: number) =>
        put(x, base + lift - y, ink);
      const beam = (
        fromX: number,
        fromY: number,
        toX: number,
        toY: number,
        ink: number,
      ) => {
        const steps = Math.ceil(Math.hypot(toX - fromX, toY - fromY) * 2);
        for (let step = 0; step <= steps; step++)
          stand(
            fromX + ((toX - fromX) * step) / steps,
            fromY + ((toY - fromY) * step) / steps,
            ink,
          );
      };

      for (
        let x = box.left - 20 * scale;
        x < box.right + 20 * scale;
        x += 22 * scale
      ) {
        beam(x, 0, x, 34 * scale, POLE);
        beam(x + 22 * scale, 0, x + 22 * scale, 34 * scale, POLE);
        beam(x, 0, x + 22 * scale, 17 * scale, POLE);
        beam(x + 22 * scale, 17 * scale, x, 34 * scale, POLE);
        beam(x, 17 * scale, x + 22 * scale, 17 * scale, POLE);
        beam(x, 34 * scale, x + 22 * scale, 34 * scale, POLE);
      }

      const girder = 5 * scale;
      for (let y = 0; y < mastTall; y += girder) {
        beam(mast - 3 * scale, y, mast + 3 * scale, y + girder, CAUTION);
        beam(mast + 3 * scale, y, mast - 3 * scale, y + girder, CAUTION);
      }
      beam(mast - 3 * scale, 0, mast - 3 * scale, mastTall, CAUTION);
      beam(mast + 3 * scale, 0, mast + 3 * scale, mastTall, CAUTION);
      for (let x = -counter; x <= jib; x += 0.5) {
        stand(mast + x, mastTall, CAUTION);
        stand(mast + x, mastTall + 5 * scale, CAUTION);
      }
      for (let x = -counter; x < jib; x += 5 * scale)
        beam(
          mast + x,
          mastTall,
          mast + x + 5 * scale,
          mastTall + 5 * scale,
          CAUTION,
        );
      for (let y = 0; y < 6 * scale; y++)
        for (let x = 0; x < 9 * scale; x++)
          stand(mast - counter + x - 2 * scale, mastTall - y, STEEL);

      const trolley = mast + jib * (0.45 + Math.sin(seconds * 0.8) * 0.4);
      const swing = Math.sin(seconds * 2.2) * 3 * scale;
      const drop = 26 * scale + Math.sin(seconds * 0.8 + 1) * 8 * scale;
      beam(trolley, mastTall, trolley + swing, mastTall - drop, STEEL);
      const load = 13 * scale;
      for (let y = 0; y < load * 0.75; y++)
        for (let x = 0; x < load; x++)
          if (threshold(x, y) < 0.7)
            stand(
              trolley + swing + x - load / 2,
              mastTall - drop - y,
              (x >> 1) % 3 === 0 ? CAUTION : STEEL,
            );

      for (let y = box.bottom; y < rows; y++)
        for (let x = 0; x < cols; x++) {
          const stripe = (x + y) % 12 < 6;
          if (y < box.bottom + 7 * scale && stripe) put(x, y, CAUTION);
        }
    };
  },
} satisfies Effect;
