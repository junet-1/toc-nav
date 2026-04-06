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
