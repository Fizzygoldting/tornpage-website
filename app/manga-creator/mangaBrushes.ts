/**
 * Digital stand-ins for common manga inking / correction tools.
 * Names follow Japanese studio vocabulary where it helps.
 */
export type MangaBrushPreset =
  | "g-pen"
  | "round-pen"
  | "mapping"
  | "marker"
  | "pencil"
  | "white"
  | "eraser";

export const MANGA_BRUSH_ORDER: MangaBrushPreset[] = [
  "g-pen",
  "round-pen",
  "mapping",
  "marker",
  "pencil",
  "white",
  "eraser",
];

type BrushConfig = {
  label: string;
  /** Shown in UI subtitle */
  blurb: string;
  widthMult: number;
  alpha: number;
  composite: GlobalCompositeOperation;
  lineCap: CanvasLineCap;
  lineJoin: CanvasLineJoin;
  /** How stroke color is chosen from the ink picker */
  strokeMode: "ink" | "white" | "pencil" | "eraser";
};

export const MANGA_BRUSH_CONFIG: Record<MangaBrushPreset, BrushConfig> = {
  "g-pen": {
    label: "G-pen",
    blurb: "Crisp main lines (ジーペン)",
    widthMult: 1,
    alpha: 1,
    composite: "source-over",
    lineCap: "round",
    lineJoin: "round",
    strokeMode: "ink",
  },
  "round-pen": {
    label: "Round pen",
    blurb: "Softer uniform strokes (丸ペン)",
    widthMult: 1.05,
    alpha: 1,
    composite: "source-over",
    lineCap: "round",
    lineJoin: "round",
    strokeMode: "ink",
  },
  mapping: {
    label: "Mapping pen",
    blurb: "Fine details & hatching (カケペン)",
    widthMult: 0.38,
    alpha: 1,
    composite: "source-over",
    lineCap: "butt",
    lineJoin: "miter",
    strokeMode: "ink",
  },
  marker: {
    label: "Marker / fill",
    blurb: "Bold fills & blacks (サインペン風)",
    widthMult: 2.1,
    alpha: 1,
    composite: "source-over",
    lineCap: "round",
    lineJoin: "round",
    strokeMode: "ink",
  },
  pencil: {
    label: "Blue pencil",
    blurb: "Non-photo blue roughs (下書き)",
    widthMult: 0.95,
    alpha: 1,
    composite: "source-over",
    lineCap: "round",
    lineJoin: "round",
    strokeMode: "pencil",
  },
  white: {
    label: "White ink",
    blurb: "Highlights & fixes (ホワイト)",
    widthMult: 1.1,
    alpha: 1,
    composite: "source-over",
    lineCap: "round",
    lineJoin: "round",
    strokeMode: "white",
  },
  eraser: {
    label: "Eraser",
    blurb: "Lift ink from the page",
    widthMult: 1.65,
    alpha: 1,
    composite: "destination-out",
    lineCap: "round",
    lineJoin: "round",
    strokeMode: "eraser",
  },
};

export function resolveStrokeStyle(
  preset: MangaBrushPreset,
  inkColor: string,
): string {
  const cfg = MANGA_BRUSH_CONFIG[preset];
  switch (cfg.strokeMode) {
    case "white":
      return "#f8fafc";
    case "pencil":
      return "rgba(70, 110, 160, 0.42)";
    case "eraser":
      return "rgba(0,0,0,1)";
    default:
      return inkColor;
  }
}
