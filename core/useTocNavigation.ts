'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { RefObject, MutableRefObject } from 'react'
import type { TocItem } from '../types'
import { buildPath, LINE_X } from './buildPath'
import { docToSvgY } from './docToSvgY'

export interface UseTocNavigationOptions {
  /**
   * Pixels from the top of the viewport reserved for a sticky header.
   * Used both for active-section detection and smooth-scroll offset.
   * @default 88
   */
  headerOffset?: number
}

export interface TocNavigationState {
  /** IDs of headings currently visible in (or nearest to) the viewport. */
  visibleIds: string[]
  /** SVG `d` attribute for the track line. Empty until after first layout. */
  svgPath: string
  /** Height of the SVG canvas (matches list scrollHeight). */
  svgH: number
  /** False until the first scroll computation runs — lets consumers fade in. */
  ready: boolean
  /** Attach to the `<ul>` that renders the TOC items. */
  listRef: RefObject<HTMLUListElement>
  /** Attach each `<li>` by its heading ID: `ref={(el) => { ... itemRefs.current.set(id, el) }}` */
  itemRefs: MutableRefObject<Map<string, HTMLLIElement>>
  /** Attach to the `<rect>` inside the SVG clipPath. Updated every rAF frame. */
  clipRectRef: RefObject<SVGRectElement>
  /** Attach to the foreground `<path>`. Used for dot binary-search. */
  fgPathRef: RefObject<SVGPathElement>
  /** Attach to the dot `<g>`. Transform is updated every rAF frame. */
  dotGroupRef: RefObject<SVGGElement>
  /** Smooth-scroll the page to a heading anchor. */
  scrollTo: (id: string) => void
}

export function useTocNavigation(
  items: TocItem[],
  { headerOffset = 88 }: UseTocNavigationOptions = {},
): TocNavigationState {
  const [visibleIds, setVisibleIds] = useState<string[]>(
    items[0] ? [items[0].id] : [],
  )
  const visibleIdsRef = useRef<string[]>([])
  const [svgPath, setSvgPath] = useState('')
  const [svgH, setSvgH] = useState(0)
  const [ready, setReady] = useState(false)

  const listRef = useRef<HTMLUListElement>(null)
  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map())
  const rafRef = useRef<number>(0)
  const prevScrollYRef = useRef(0)
  const scrollDirRef = useRef<'down' | 'up'>('down')

  // Heading positions — refreshed after mount and on resize
  const articleTopsRef = useRef<number[]>([])
  const tocYsRef = useRef<number[]>([])
  const svgHRef = useRef(0)

  // DOM refs updated every rAF frame — no React re-render cost
  const clipRectRef = useRef<SVGRectElement>(null)
  const fgPathRef = useRef<SVGPathElement>(null)
  const dotGroupRef = useRef<SVGGElement>(null)

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - headerOffset,
      behavior: 'smooth',
    })
  }

  // ── Build SVG path after list renders ────────────────────────────────────
  useLayoutEffect(() => {
    const build = () => {
      const listEl = listRef.current
      if (!listEl) return

      const pts = items
        .map(({ id, level }) => {
          const el = itemRefs.current.get(id)
          if (!el) return null
          return { x: LINE_X[level], y: el.offsetTop + el.offsetHeight / 2 }
        })
        .filter((p): p is { x: number; y: number } => p !== null)

      const h = listEl.scrollHeight
      setSvgPath(buildPath(pts))
      setSvgH(h)
      svgHRef.current = h
      tocYsRef.current = pts.map((p) => p.y)
    }

    const t = setTimeout(build, 60)
    const ro = new ResizeObserver(build)
    if (listRef.current) ro.observe(listRef.current)
    return () => {
      clearTimeout(t)
      ro.disconnect()
    }
  }, [items])

  // ── Measure article heading positions in document space ──────────────────
  useEffect(() => {
    const measure = () => {
      articleTopsRef.current = items.map(({ id }) => {
        const el = document.getElementById(id)
        return el ? el.getBoundingClientRect().top + window.scrollY : 0
      })
      // Re-sync tocYs in case layout changed after font/image load
      tocYsRef.current = items.map(({ id }) => {
        const el = itemRefs.current.get(id)
        return el ? el.offsetTop + el.offsetHeight / 2 : 0
      })
    }

    const t = setTimeout(measure, 150)
    window.addEventListener('resize', measure)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', measure)
    }
  }, [items])

  // ── Scroll listener — all per-frame updates bypass React state ───────────
  useEffect(() => {
    if (items.length === 0) return

    const compute = () => {
      const rawScrollY = window.scrollY
      const scrollY = rawScrollY + headerOffset

      if (rawScrollY !== prevScrollYRef.current) {
        scrollDirRef.current = rawScrollY > prevScrollYRef.current ? 'down' : 'up'
      }
      prevScrollYRef.current = rawScrollY

      const articleTops = articleTopsRef.current
      const tocYs = tocYsRef.current
      const h = svgHRef.current

      // Determine the current section index (scroll-position fallback)
      let idx = 0
      for (let i = articleTops.length - 1; i >= 0; i--) {
        if (scrollY >= articleTops[i]) {
          idx = i
          break
        }
      }

      // Headings whose anchor is within the current viewport
      const viewportBottom = rawScrollY + window.innerHeight
      const visible = articleTops
        .map((top, i) => (top >= rawScrollY && top <= viewportBottom ? items[i].id : null))
        .filter((id): id is string => id !== null)

      // Fallback: highlight current section when nothing is in view
      const next = visible.length > 0 ? visible : [items[idx].id]

      if (next.join(',') !== visibleIdsRef.current.join(',')) {
        visibleIdsRef.current = next
        setVisibleIds(next)
      }

      if (articleTops.length === 0 || tocYs.length === 0 || h === 0) return

      // ── Clip foreground path to viewport slice ───────────────────────────
      const segT = docToSvgY(rawScrollY, articleTops, tocYs)
      const segB = docToSvgY(rawScrollY + window.innerHeight, articleTops, tocYs)

      if (clipRectRef.current) {
        const top = Math.max(0, segT)
        const bot = Math.min(h, segB)
        clipRectRef.current.setAttribute('y', String(top))
        clipRectRef.current.setAttribute('height', String(Math.max(0, bot - top)))
      }

      // ── Dot: binary search on monotone path Y ────────────────────────────
      const targetY = scrollDirRef.current === 'down' ? segB : segT
      const fgPath = fgPathRef.current
      const dotGroup = dotGroupRef.current

      if (fgPath && dotGroup) {
        // 12 iterations → precision ~totalLength/4096 (≈0.07 px for a 300 px path)
        const total = fgPath.getTotalLength()
        let lo = 0
        let hi = total
        for (let i = 0; i < 12; i++) {
          const mid = (lo + hi) / 2
          if (fgPath.getPointAtLength(mid).y < targetY) lo = mid
          else hi = mid
        }
        const best = fgPath.getPointAtLength((lo + hi) / 2)
        dotGroup.setAttribute(
          'transform',
          `translate(${best.x.toFixed(2)},${best.y.toFixed(2)})`,
        )
      }

      if (!ready) setReady(true)
    }

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(compute)
    }

    const t = setTimeout(compute, 160)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      clearTimeout(t)
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafRef.current)
    }
  }, [items, ready, headerOffset])

  return {
    visibleIds,
    svgPath,
    svgH,
    ready,
    listRef,
    itemRefs,
    clipRectRef,
    fgPathRef,
    dotGroupRef,
    scrollTo,
  }
}
