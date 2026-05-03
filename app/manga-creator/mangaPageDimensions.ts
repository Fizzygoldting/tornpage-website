/**
 * Professional manga draft sheet proportions (B4-style trim with print margins).
 * Live area is the typical inner artwork zone; printed tankōbon are often B5/B6.
 */
export const MANGA_B4_TRIM_MM = { width: 220, height: 310 } as const;

/** Typical inner “live” artwork rectangle inside trim margins (mm). */
export const MANGA_LIVE_AREA_MM = {
  width: 180,
  height: 270,
  /** Equal margins on B4 when 180×270 is centered in 220×310. */
  marginMm: 20,
} as const;

/** Portrait page height ÷ width — use for layout + canvas pixel ratio. */
export const MANGA_PAGE_ASPECT =
  MANGA_B4_TRIM_MM.height / MANGA_B4_TRIM_MM.width;

/**
 * Fixed “4K-class” trim width in device pixels (pixel-accurate sheet; not CSS mm).
 * Height follows B4 trim aspect so guides and export stay proportional.
 */
export const MANGA_PAGE_PIXEL_WIDTH = 3840;
export const MANGA_PAGE_PIXEL_HEIGHT = Math.round(
  MANGA_PAGE_PIXEL_WIDTH * MANGA_PAGE_ASPECT,
);

/** Pixels per mm on the trim sheet — for stroke widths that feel consistent on paper. */
export const MANGA_PX_PER_MM =
  MANGA_PAGE_PIXEL_WIDTH / MANGA_B4_TRIM_MM.width;
