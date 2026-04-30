import { MANGA_LIVE_AREA_MM } from "./mangaPageDimensions";

/** Faint panel layouts drawn inside the live artwork area (mm, trim sheet space). */
export type PanelTemplateId =
  | "off"
  | "grid2x2"
  | "rows3"
  | "rows4"
  | "cols2"
  | "splash"
  | "wideBottom";

export const PANEL_TEMPLATE_OPTIONS: { id: PanelTemplateId; label: string }[] = [
  { id: "off", label: "Off" },
  { id: "grid2x2", label: "2×2 grid" },
  { id: "rows3", label: "3 horizontal rows" },
  { id: "rows4", label: "4 horizontal rows" },
  { id: "cols2", label: "2 columns" },
  { id: "splash", label: "Big top + 3 bottom" },
  { id: "wideBottom", label: "2 top + wide bottom" },
];

function liveBox() {
  const L = MANGA_LIVE_AREA_MM.marginMm;
  const T = MANGA_LIVE_AREA_MM.marginMm;
  const W = MANGA_LIVE_AREA_MM.width;
  const H = MANGA_LIVE_AREA_MM.height;
  return { L, T, W, H };
}

function getPanelRects(id: PanelTemplateId): { x: number; y: number; w: number; h: number }[] {
  if (id === "off") return [];
  const { L, T, W, H } = liveBox();

  switch (id) {
    case "grid2x2": {
      const cw = W / 2;
      const ch = H / 2;
      return [
        { x: L, y: T, w: cw, h: ch },
        { x: L + cw, y: T, w: cw, h: ch },
        { x: L, y: T + ch, w: cw, h: ch },
        { x: L + cw, y: T + ch, w: cw, h: ch },
      ];
    }
    case "rows3": {
      const ch = H / 3;
      return [0, 1, 2].map((i) => ({
        x: L,
        y: T + i * ch,
        w: W,
        h: ch,
      }));
    }
    case "rows4": {
      const ch = H / 4;
      return [0, 1, 2, 3].map((i) => ({
        x: L,
        y: T + i * ch,
        w: W,
        h: ch,
      }));
    }
    case "cols2": {
      const cw = W / 2;
      return [
        { x: L, y: T, w: cw, h: H },
        { x: L + cw, y: T, w: cw, h: H },
      ];
    }
    case "splash": {
      const topH = 165;
      const botH = H - topH;
      const cw = W / 3;
      return [
        { x: L, y: T, w: W, h: topH },
        { x: L, y: T + topH, w: cw, h: botH },
        { x: L + cw, y: T + topH, w: cw, h: botH },
        { x: L + 2 * cw, y: T + topH, w: cw, h: botH },
      ];
    }
    case "wideBottom": {
      const topH = H * 0.38;
      const botH = H - topH;
      const cw = W / 2;
      return [
        { x: L, y: T, w: cw, h: topH },
        { x: L + cw, y: T, w: cw, h: topH },
        { x: L, y: T + topH, w: W, h: botH },
      ];
    }
    default:
      return [];
  }
}

export function PanelTemplateGuideGroup({ templateId }: { templateId: PanelTemplateId }) {
  if (templateId === "off") return null;
  const rects = getPanelRects(templateId);
  return (
    <g
      fill="none"
      stroke="rgba(113, 113, 122, 0.6)"
      strokeWidth="0.55"
      strokeDasharray="3 3"
    >
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} rx="0.4" />
      ))}
    </g>
  );
}
