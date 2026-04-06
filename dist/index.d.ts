import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode, RefObject, MutableRefObject } from 'react';

interface TocItem {
    id: string;
    text: string;
    level: 2 | 3;
}

type TocPosition = 'right' | 'left' | 'inline';
interface TocNavProps {
    items: TocItem[];
    /**
     * Custom icon rendered in the mobile toggle button.
     * Receives a `data-open` attribute you can target in CSS for rotation.
     * Defaults to a chevron SVG.
     */
    icon?: ReactNode;
    /**
     * Pixels from the top of the viewport reserved for a sticky header.
     * Used for active-section detection and smooth-scroll offset.
     * @default 88
     */
    headerOffset?: number;
    /** Override label text. @default "On this page" */
    label?: string;
    /**
     * Controls where the TOC is rendered.
     * - `right` (default): fixed to the right of the content column
     * - `left`: fixed to the left side of the viewport
     * - `inline`: flows with the document, visible at all breakpoints
     * @default "right"
     */
    position?: TocPosition;
    /**
     * Max-width of the main content column (e.g. `"65ch"`, `"860px"`).
     * Used when `position="right"` to compute the correct right offset.
     * Falls back to `1rem` from the viewport edge when omitted.
     */
    containerWidth?: string;
    /** Additional classes merged onto the `<nav>` element. Use to override width, top offset, etc. */
    className?: string;
}
declare function TocNav({ items, icon, headerOffset, label, position, containerWidth, className, }: TocNavProps): react_jsx_runtime.JSX.Element | null;

interface UseTocNavigationOptions {
    /**
     * Pixels from the top of the viewport reserved for a sticky header.
     * Used both for active-section detection and smooth-scroll offset.
     * @default 88
     */
    headerOffset?: number;
}
interface TocNavigationState {
    /** IDs of headings currently visible in (or nearest to) the viewport. */
    visibleIds: string[];
    /** SVG `d` attribute for the track line. Empty until after first layout. */
    svgPath: string;
    /** Height of the SVG canvas (matches list scrollHeight). */
    svgH: number;
    /** False until the first scroll computation runs — lets consumers fade in. */
    ready: boolean;
    /** Attach to the `<ul>` that renders the TOC items. */
    listRef: RefObject<HTMLUListElement>;
    /** Attach each `<li>` by its heading ID: `ref={(el) => { ... itemRefs.current.set(id, el) }}` */
    itemRefs: MutableRefObject<Map<string, HTMLLIElement>>;
    /** Attach to the `<rect>` inside the SVG clipPath. Updated every rAF frame. */
    clipRectRef: RefObject<SVGRectElement>;
    /** Attach to the foreground `<path>`. Used for dot binary-search. */
    fgPathRef: RefObject<SVGPathElement>;
    /** Attach to the dot `<g>`. Transform is updated every rAF frame. */
    dotGroupRef: RefObject<SVGGElement>;
    /** Smooth-scroll the page to a heading anchor. */
    scrollTo: (id: string) => void;
}
declare function useTocNavigation(items: TocItem[], { headerOffset }?: UseTocNavigationOptions): TocNavigationState;

/** X position (px) of the SVG track line per heading level. */
declare const LINE_X: Record<2 | 3, number>;
declare function buildPath(pts: {
    x: number;
    y: number;
}[]): string;

declare function docToSvgY(docY: number, articleTops: number[], tocYs: number[]): number;

export { LINE_X, type TocItem, TocNav, type TocNavProps, type TocNavigationState, type TocPosition, type UseTocNavigationOptions, buildPath, docToSvgY, useTocNavigation };
