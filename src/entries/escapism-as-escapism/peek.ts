import { packed, type Effect } from "../../lib/dither/effect";
import { hash } from "../../lib/hash";
import {
  ASPECT,
  CENTRE,
  DOOR_HEIGHT,
  DOOR_MIDDLE,
  INKS,
  inkAt,
  isMoon,
  isOpenSky,
  toneAt,
} from "./components/scene";

const DOOR_SHARE_OF_STAGE = 0.8;
const NIGHT_INK = 1;
const STAR = INKS.length - 1;

export default {
  reach: { top: 0.5, right: 0.35, bottom: 0.6, left: 0.35 },
  paint({ cols, rows, box, gate, seed }) {
    const inks = INKS.map(packed);
    const tall = (rows * DOOR_SHARE_OF_STAGE) / DOOR_HEIGHT;
    const wide = tall * ASPECT;
    const middleX = (box.left + box.right) / 2;
    const middleY = (box.top + box.bottom) / 2;

    const cells = new Uint8Array(cols * rows);
    const stars: { index: number; phase: number }[] = [];
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) {
        const u = CENTRE + (x - middleX) / wide;
        const v = DOOR_MIDDLE + (y - middleY) / tall;
        const ink = isMoon(u, v) ? NIGHT_INK : inkAt(toneAt(u, v, x, y), x, y);
        const index = y * cols + x;
        cells[index] = ink;
        if (ink === STAR && isOpenSky(u, v))
          stars.push({ index, phase: (hash(`${seed}:${index}`) % 100) / 100 });
      }

    return (pixels, seconds, reveal) => {
      for (let i = 0; i < cells.length; i++)
        if (gate[i] < reveal) pixels[i] = inks[cells[i]];
      for (const { index, phase } of stars) {
        const twinkle = Math.sin((seconds / 2 + phase) * Math.PI * 2);
        if (twinkle < -0.2 && gate[index] < reveal)
          pixels[index] = inks[NIGHT_INK];
      }
    };
  },
} satisfies Effect;
