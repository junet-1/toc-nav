/** X position (px) of the SVG track line per heading level. */
export const LINE_X: Record<2 | 3, number> = { 2: 6, 3: 14 }

const CORNER_R = 5

/**
 * Build the indented SVG path with rounded corners at level-change bends.
 * Pure function — no side effects, no DOM access.
 */
export function buildPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x} ${pts[0].y}`

  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1]
    const cur = pts[i]

    if (prev.x === cur.x) {
      d += ` V ${cur.y}`
    } else {
      const mid = (prev.y + cur.y) / 2
      const r = Math.min(CORNER_R, Math.abs(mid - prev.y) - 1, Math.abs(cur.y - mid) - 1)

      if (r <= 0) {
        d += ` V ${mid} H ${cur.x} V ${cur.y}`
      } else if (cur.x > prev.x) {
        // h2 → h3: step right
        d += ` V ${mid - r} Q ${prev.x},${mid} ${prev.x + r},${mid} H ${cur.x - r} Q ${cur.x},${mid} ${cur.x},${mid + r} V ${cur.y}`
      } else {
        // h3 → h2: step left
        d += ` V ${mid - r} Q ${prev.x},${mid} ${prev.x - r},${mid} H ${cur.x + r} Q ${cur.x},${mid} ${cur.x},${mid + r} V ${cur.y}`
      }
    }
  }

  return d
}
