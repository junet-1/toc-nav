# toc-nav

A scroll-synchronized navigation component with an animated SVG path and a dot that rides the track as you scroll.

![toc-nav preview](./preview/preview.gif)

---

## Features

- **Scroll-synced SVG path** not IntersectionObserver hacks; pixel-accurate mapping from document position to SVG coordinates
- **Viewport-aware clip** the bright segment shows exactly what's in view, dim track shows the rest
- **Dot that rides the path** binary-searched every rAF frame, zero React re-renders
- **Rounded indent steps** smooth bezier corners when stepping between h2 and h3
- **Three layout modes** `right` (fixed sidebar), `left`, or `inline` (flows with content)
- **Headless core** `useTocNavigation` hook so you can build any UI on top
- **No extra dependencies** no lucide-react, no clsx, no external cn utility

---

## Installation

```bash
npm install toc-nav
```

```bash
# optional: import default CSS variable definitions
import 'toc-nav/styles.css'
```

**Peer deps:** React 18+

---

## Quick start

```tsx
import { TocNav } from 'toc-nav'
import type { TocItem } from 'toc-nav'

const headings: TocItem[] = [
  { id: 'intro',  text: 'Introduction',  level: 2 },
  { id: 'setup',  text: 'Setup',         level: 2 },
  { id: 'config', text: 'Configuration', level: 3 },
  { id: 'deploy', text: 'Deploy',        level: 2 },
]

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <TocNav items={headings} containerWidth="56rem" />
      <article>{children}</article>
    </div>
  )
}
```

Renders a **collapsible mobile bar** and a **fixed desktop sidebar**. Disappears automatically when fewer than 2 headings are passed.

---

## Props

### `TocNav`

| Prop             | Type          | Default          | Description |
| ---------------- | ------------- | ---------------- | ----------- |
| `items`          | `TocItem[]`   | —                | Ordered heading list. Each item needs `id`, `text`, `level`. |
| `position`       | `TocPosition` | `"right"`        | `"right"` fixed sidebar · `"left"` fixed sidebar · `"inline"` flows with the document |
| `containerWidth` | `string`      | —                | Max-width of your content column (e.g. `"56rem"`). Used to compute the right offset so the TOC hugs the column edge. |
| `headerOffset`   | `number`      | `88`             | Pixels reserved for a sticky header — affects scroll tracking and smooth-scroll target. |
| `label`          | `string`      | `"On this page"` | Shown in the mobile toggle and as `aria-label` on the nav. |
| `icon`           | `ReactNode`   | chevron SVG      | Custom icon for the mobile toggle button. |
| `className`      | `string`      | —                | Extra classes merged onto the `<nav>` element. Use to override width, top offset, etc. |

### `TocItem`

```ts
interface TocItem {
  id: string     // must match the heading element's id in the DOM
  text: string
  level: 2 | 3  // h2 and h3 only
}
```

### `TocPosition`

```ts
type TocPosition = 'right' | 'left' | 'inline'
```

| Value    | Behaviour |
| -------- | --------- |
| `right`  | Fixed to the right of the content column. Uses `containerWidth` for precise offset. Mobile shows a collapsible accordion. |
| `left`   | Fixed to the left side of the viewport. Same mobile behaviour. |
| `inline` | Flows with the document — visible at all breakpoints, no mobile toggle. Drop it between your intro and first section. |

---

## CSS variables

The SVG track reads these variables. Import `toc-nav/styles.css` to get safe defaults, or define your own:

| Variable             | Default   | Used for                    |
| -------------------- | --------- | --------------------------- |
| `--color-primary`    | `#3b82f6` | Active track segment + dot  |
| `--color-border`     | `#e2e8f0` | Dim background track        |
| `--color-background` | `#ffffff` | Dot halo (punches the line) |

All variables have hardcoded fallbacks, so the component renders correctly even without the CSS import.

---

## Headless usage

Use `useTocNavigation` when you want full control over markup and styling:

```tsx
'use client'

import { useTocNavigation } from 'toc-nav'
import type { TocItem } from 'toc-nav'

export function MyToc({ items }: { items: TocItem[] }) {
  const {
    visibleIds, svgPath, svgH, ready,
    listRef, itemRefs,
    clipRectRef, fgPathRef, dotGroupRef,
    scrollTo,
  } = useTocNavigation(items, { headerOffset: 64 })

  return (
    <nav style={{ opacity: ready ? 1 : 0 }}>
      {/* your SVG + list markup here */}
    </nav>
  )
}
```

### Hook return values

| Key           | Type                                            | Description |
| ------------- | ----------------------------------------------- | ----------- |
| `visibleIds`  | `string[]`                                      | IDs of headings visible in (or nearest to) the viewport. |
| `svgPath`     | `string`                                        | SVG `d` attribute for the track. Empty until after first layout. |
| `svgH`        | `number`                                        | Height of the SVG canvas (equals the list's `scrollHeight`). |
| `ready`       | `boolean`                                       | `true` after the first scroll computation — use to fade in. |
| `listRef`     | `RefObject<HTMLUListElement>`                   | Attach to the `<ul>`. |
| `itemRefs`    | `MutableRefObject<Map<string, HTMLLIElement>>`  | Attach each `<li>` by heading ID. |
| `clipRectRef` | `RefObject<SVGRectElement>`                     | Attach to the clip `<rect>`. Updated every rAF frame. |
| `fgPathRef`   | `RefObject<SVGPathElement>`                     | Attach to the foreground `<path>`. Used for dot positioning. |
| `dotGroupRef` | `RefObject<SVGGElement>`                        | Attach to the dot `<g>`. Transform updated every rAF frame. |
| `scrollTo`    | `(id: string) => void`                          | Smooth-scrolls to the heading anchor. |

---

## Extracting headings from MDX

`TocItem` is framework-agnostic. Minimal extractor using `github-slugger` (same algorithm as `rehype-slug`):

```ts
import GithubSlugger from 'github-slugger'
import type { TocItem } from 'toc-nav'

export function extractHeadings(mdxSource: string): TocItem[] {
  const slugger = new GithubSlugger()
  const matches = [...mdxSource.matchAll(/^(#{2,3})\s+(.+)$/gm)]
  return matches.map((m) => ({
    level: m[1].length as 2 | 3,
    text: m[2].trim().replace(/`([^`]+)`/g, '$1'),
    id: slugger.slug(m[2].trim()),
  }))
}
```

---

## License

MIT
