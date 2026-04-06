/**
 * Map a document Y coordinate to an SVG-path Y coordinate using piecewise
 * linear interpolation between the known heading anchor points.
 *
 * This correctly handles non-uniform heading distribution in the document —
 * a heading that takes up 30 % of the article maps to 30 % of the SVG track,
 * not a fixed pixel offset.
 *
 * Pure function — no side effects, no DOM access.
 *
 * @param docY        - Absolute document Y (e.g. `window.scrollY`)
 * @param articleTops - Absolute document Y of each heading anchor (same order as items)
 * @param tocYs       - Corresponding SVG Y of each TOC list item midpoint
 */
export function docToSvgY(
  docY: number,
  articleTops: number[],
  tocYs: number[],
): number {
  const n = articleTops.length
  if (n === 0) return 0
  if (n === 1) return tocYs[0]

  // Extrapolate before the first heading
  if (docY <= articleTops[0]) {
    const rate = (tocYs[1] - tocYs[0]) / Math.max(1, articleTops[1] - articleTops[0])
    return tocYs[0] + (docY - articleTops[0]) * rate
  }

  // Extrapolate after the last heading
  if (docY >= articleTops[n - 1]) {
    const rate =
      (tocYs[n - 1] - tocYs[n - 2]) / Math.max(1, articleTops[n - 1] - articleTops[n - 2])
    return tocYs[n - 1] + (docY - articleTops[n - 1]) * rate
  }

  // Interpolate between adjacent headings
  for (let i = 0; i < n - 1; i++) {
    if (docY >= articleTops[i] && docY < articleTops[i + 1]) {
      const t = (docY - articleTops[i]) / (articleTops[i + 1] - articleTops[i])
      return tocYs[i] + (tocYs[i + 1] - tocYs[i]) * t
    }
  }

  return tocYs[n - 1]
}
