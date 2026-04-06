'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import type { TocItem } from '../types'
import { useTocNavigation } from '../core/useTocNavigation'

// Zero-dependency cn — no @/lib/utils required
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}

// Inline chevron so lucide-react is not required
function DefaultChevron() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export interface TocNavProps {
  items: TocItem[]
  /**
   * Custom icon rendered in the mobile toggle button.
   * Receives a `data-open` attribute you can target in CSS for rotation.
   * Defaults to a chevron SVG.
   */
  icon?: ReactNode
  /**
   * Pixels from the top of the viewport reserved for a sticky header.
   * Used for active-section detection and smooth-scroll offset.
   * @default 88
   */
  headerOffset?: number
  /** Override label text. @default "On this page" */
  label?: string
}

export function TocNav({ items, icon, headerOffset = 88, label = 'On this page' }: TocNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const {
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
  } = useTocNavigation(items, { headerOffset })

  if (items.length < 2) return null

  const chevron = icon ?? <DefaultChevron />

  return (
    <>
      {/* ── Mobile inline collapsible (hidden on xl+) ── */}
      <div className="xl:hidden mb-8 rounded-lg border border-border/40 bg-muted/30 overflow-hidden">
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
          aria-expanded={mobileOpen}
          aria-controls="toc-mobile-list"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {label}
          </span>
          <span
            className={cn(
              'text-muted-foreground transition-transform duration-200',
              mobileOpen && 'rotate-180',
            )}
          >
            {chevron}
          </span>
        </button>

        {mobileOpen && (
          <ul id="toc-mobile-list" className="flex flex-col pb-2 border-t border-border/40">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    setMobileOpen(false)
                    scrollTo(item.id)
                  }}
                  className={cn(
                    'block px-4 py-2 text-sm leading-snug transition-colors hover:text-foreground',
                    item.level === 3
                      ? 'pl-8 text-muted-foreground/70'
                      : 'text-muted-foreground',
                  )}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Desktop fixed sidebar (xl+) ── */}
      <nav
        aria-label={label}
        className={cn(
          'hidden xl:flex flex-col fixed top-24 w-52',
          'max-h-[calc(100vh-7rem)] overflow-y-auto',
          '[&::-webkit-scrollbar]:w-0',
          'transition-opacity duration-300',
          ready ? 'opacity-100' : 'opacity-0',
        )}
        style={{ right: 'max(1rem, calc((100vw - 50rem) / 2 - 13rem - 1.5rem))' }}
      >
        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50 pl-6">
          {label}
        </p>

        <div className="relative">
          {svgPath && (
            <svg
              width={20}
              height={svgH}
              className="absolute top-0 left-0 pointer-events-none overflow-visible"
              aria-hidden
            >
              <defs>
                {/* Clip rect updated each rAF frame — no React re-render */}
                <clipPath id="toc-viewport-clip">
                  <rect ref={clipRectRef} x={-10} y={0} width={40} height={0} />
                </clipPath>
              </defs>

              {/* Dim background track */}
              <path
                d={svgPath}
                fill="none"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ stroke: 'var(--color-border)' }}
              />

              {/* Bright foreground track clipped to viewport slice */}
              <path
                ref={fgPathRef}
                d={svgPath}
                fill="none"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                clipPath="url(#toc-viewport-clip)"
                style={{ stroke: 'var(--color-primary)' }}
              />

              {/* Dot: halo punches through the line, primary dot sits on top */}
              <g ref={dotGroupRef} transform="translate(-100,-100)">
                <circle r={5.5} style={{ fill: 'var(--color-background)' }} />
                <circle r={3} style={{ fill: 'var(--color-primary)' }} />
              </g>
            </svg>
          )}

          <ul ref={listRef} className="flex flex-col">
            {items.map((item) => {
              const isActive = visibleIds.includes(item.id)
              return (
                <li
                  key={item.id}
                  ref={(el) => {
                    if (el) itemRefs.current.set(item.id, el)
                    else itemRefs.current.delete(item.id)
                  }}
                >
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault()
                      scrollTo(item.id)
                    }}
                    className={cn(
                      'block py-1.5 text-[13px] leading-snug transition-colors duration-150 truncate',
                      item.level === 2 ? 'pl-6' : 'pl-9',
                      isActive
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground/70 hover:text-foreground',
                    )}
                  >
                    {item.text}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>
    </>
  )
}
