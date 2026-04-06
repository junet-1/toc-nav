// UI component
export { TocNav } from './components/TocNav'
export type { TocNavProps } from './components/TocNav'

// Headless hook bring your own UI
export { useTocNavigation } from './core/useTocNavigation'
export type { UseTocNavigationOptions, TocNavigationState } from './core/useTocNavigation'

// Pure utilities
export { buildPath, LINE_X } from './core/buildPath'
export { docToSvgY } from './core/docToSvgY'

// Types
export type { TocItem } from './types'
