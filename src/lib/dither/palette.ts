export type Rgb = [number, number, number];
export type Rgba = [number, number, number, number];

export const CHARCOAL: Rgb = [0x29, 0x28, 0x24];
export const PAPER: Rgb = [0xf2, 0xf0, 0xe9];
export const MUTED: Rgb = [0xb8, 0xb5, 0xaa];
export const RULE_ON_PAPER: Rgb = [0xc9, 0xc6, 0xbb];

export const CLEAR: Rgba = [0, 0, 0, 0];
export const opaque = ([r, g, b]: Rgb): Rgba => [r, g, b, 255];
export const hex = (rgb: Rgb) =>
  `#${rgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
