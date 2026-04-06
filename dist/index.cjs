'use client'
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// index.ts
var index_exports = {};
__export(index_exports, {
  LINE_X: () => LINE_X,
  TocNav: () => TocNav,
  buildPath: () => buildPath,
  docToSvgY: () => docToSvgY,
  useTocNavigation: () => useTocNavigation
});
module.exports = __toCommonJS(index_exports);

// components/TocNav.tsx
var import_react2 = require("react");

// core/useTocNavigation.ts
var import_react = require("react");

// core/buildPath.ts
var LINE_X = { 2: 6, 3: 14 };
var CORNER_R = 5;
function buildPath(pts) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const cur = pts[i];
    if (prev.x === cur.x) {
      d += ` V ${cur.y}`;
    } else {
      const mid = (prev.y + cur.y) / 2;
      const r = Math.min(CORNER_R, Math.abs(mid - prev.y) - 1, Math.abs(cur.y - mid) - 1);
      if (r <= 0) {
        d += ` V ${mid} H ${cur.x} V ${cur.y}`;
      } else if (cur.x > prev.x) {
        d += ` V ${mid - r} Q ${prev.x},${mid} ${prev.x + r},${mid} H ${cur.x - r} Q ${cur.x},${mid} ${cur.x},${mid + r} V ${cur.y}`;
      } else {
        d += ` V ${mid - r} Q ${prev.x},${mid} ${prev.x - r},${mid} H ${cur.x + r} Q ${cur.x},${mid} ${cur.x},${mid + r} V ${cur.y}`;
      }
    }
  }
  return d;
}

// core/docToSvgY.ts
function docToSvgY(docY, articleTops, tocYs) {
  const n = articleTops.length;
  if (n === 0) return 0;
  if (n === 1) return tocYs[0];
  if (docY <= articleTops[0]) {
    const rate = (tocYs[1] - tocYs[0]) / Math.max(1, articleTops[1] - articleTops[0]);
    return tocYs[0] + (docY - articleTops[0]) * rate;
  }
  if (docY >= articleTops[n - 1]) {
    const rate = (tocYs[n - 1] - tocYs[n - 2]) / Math.max(1, articleTops[n - 1] - articleTops[n - 2]);
    return tocYs[n - 1] + (docY - articleTops[n - 1]) * rate;
  }
  for (let i = 0; i < n - 1; i++) {
    if (docY >= articleTops[i] && docY < articleTops[i + 1]) {
      const t = (docY - articleTops[i]) / (articleTops[i + 1] - articleTops[i]);
      return tocYs[i] + (tocYs[i + 1] - tocYs[i]) * t;
    }
  }
  return tocYs[n - 1];
}

// core/useTocNavigation.ts
function useTocNavigation(items, { headerOffset = 88 } = {}) {
  const [visibleIds, setVisibleIds] = (0, import_react.useState)(
    items[0] ? [items[0].id] : []
  );
  const visibleIdsRef = (0, import_react.useRef)([]);
  const [svgPath, setSvgPath] = (0, import_react.useState)("");
  const [svgH, setSvgH] = (0, import_react.useState)(0);
  const [ready, setReady] = (0, import_react.useState)(false);
  const listRef = (0, import_react.useRef)(null);
  const itemRefs = (0, import_react.useRef)(/* @__PURE__ */ new Map());
  const rafRef = (0, import_react.useRef)(0);
  const prevScrollYRef = (0, import_react.useRef)(0);
  const scrollDirRef = (0, import_react.useRef)("down");
  const articleTopsRef = (0, import_react.useRef)([]);
  const tocYsRef = (0, import_react.useRef)([]);
  const svgHRef = (0, import_react.useRef)(0);
  const clipRectRef = (0, import_react.useRef)(null);
  const fgPathRef = (0, import_react.useRef)(null);
  const dotGroupRef = (0, import_react.useRef)(null);
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - headerOffset,
      behavior: "smooth"
    });
  };
  (0, import_react.useLayoutEffect)(() => {
    const build = () => {
      const listEl = listRef.current;
      if (!listEl) return;
      const pts = items.map(({ id, level }) => {
        const el = itemRefs.current.get(id);
        if (!el) return null;
        return { x: LINE_X[level], y: el.offsetTop + el.offsetHeight / 2 };
      }).filter((p) => p !== null);
      const h = listEl.scrollHeight;
      setSvgPath(buildPath(pts));
      setSvgH(h);
      svgHRef.current = h;
      tocYsRef.current = pts.map((p) => p.y);
    };
    const t = setTimeout(build, 60);
    const ro = new ResizeObserver(build);
    if (listRef.current) ro.observe(listRef.current);
    return () => {
      clearTimeout(t);
      ro.disconnect();
    };
  }, [items]);
  (0, import_react.useEffect)(() => {
    const measure = () => {
      articleTopsRef.current = items.map(({ id }) => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect().top + window.scrollY : 0;
      });
      tocYsRef.current = items.map(({ id }) => {
        const el = itemRefs.current.get(id);
        return el ? el.offsetTop + el.offsetHeight / 2 : 0;
      });
    };
    const t = setTimeout(measure, 150);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, [items]);
  (0, import_react.useEffect)(() => {
    if (items.length === 0) return;
    const compute = () => {
      const rawScrollY = window.scrollY;
      const scrollY = rawScrollY + headerOffset;
      if (rawScrollY !== prevScrollYRef.current) {
        scrollDirRef.current = rawScrollY > prevScrollYRef.current ? "down" : "up";
      }
      prevScrollYRef.current = rawScrollY;
      const articleTops = articleTopsRef.current;
      const tocYs = tocYsRef.current;
      const h = svgHRef.current;
      let idx = 0;
      for (let i = articleTops.length - 1; i >= 0; i--) {
        if (scrollY >= articleTops[i]) {
          idx = i;
          break;
        }
      }
      const viewportBottom = rawScrollY + window.innerHeight;
      const visible = articleTops.map((top, i) => top >= rawScrollY && top <= viewportBottom ? items[i].id : null).filter((id) => id !== null);
      const next = visible.length > 0 ? visible : [items[idx].id];
      if (next.join(",") !== visibleIdsRef.current.join(",")) {
        visibleIdsRef.current = next;
        setVisibleIds(next);
      }
      if (articleTops.length === 0 || tocYs.length === 0 || h === 0) return;
      const segT = docToSvgY(rawScrollY, articleTops, tocYs);
      const segB = docToSvgY(rawScrollY + window.innerHeight, articleTops, tocYs);
      if (clipRectRef.current) {
        const top = Math.max(0, segT);
        const bot = Math.min(h, segB);
        clipRectRef.current.setAttribute("y", String(top));
        clipRectRef.current.setAttribute("height", String(Math.max(0, bot - top)));
      }
      const targetY = scrollDirRef.current === "down" ? segB : segT;
      const fgPath = fgPathRef.current;
      const dotGroup = dotGroupRef.current;
      if (fgPath && dotGroup) {
        const total = fgPath.getTotalLength();
        let lo = 0;
        let hi = total;
        for (let i = 0; i < 12; i++) {
          const mid = (lo + hi) / 2;
          if (fgPath.getPointAtLength(mid).y < targetY) lo = mid;
          else hi = mid;
        }
        const best = fgPath.getPointAtLength((lo + hi) / 2);
        dotGroup.setAttribute(
          "transform",
          `translate(${best.x.toFixed(2)},${best.y.toFixed(2)})`
        );
      }
      if (!ready) setReady(true);
    };
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(compute);
    };
    const t = setTimeout(compute, 160);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [items, ready, headerOffset]);
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
    scrollTo
  };
}

// components/TocNav.tsx
var import_jsx_runtime = require("react/jsx-runtime");
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
function DefaultChevron() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: 16,
      height: 16,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": true,
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "m6 9 6 6 6-6" })
    }
  );
}
var positionStyles = {
  right: "hidden xl:flex flex-col fixed top-24",
  left: "hidden xl:flex flex-col fixed top-24 left-4",
  inline: "flex flex-col w-full mb-8"
};
function TocNav({
  items,
  icon,
  headerOffset = 88,
  label = "On this page",
  position = "right",
  containerWidth,
  className
}) {
  const [mobileOpen, setMobileOpen] = (0, import_react2.useState)(false);
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
    scrollTo
  } = useTocNavigation(items, { headerOffset });
  if (items.length < 2) return null;
  const chevron = icon ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DefaultChevron, {});
  const navStyle = position === "right" ? {
    right: containerWidth ? `max(1rem, calc((100vw - ${containerWidth}) / 2 - 13rem - 1.5rem))` : "1rem"
  } : void 0;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    position !== "inline" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "xl:hidden mb-8 rounded-lg border border-border/40 bg-muted/30 overflow-hidden", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "button",
        {
          onClick: () => setMobileOpen((o) => !o),
          className: "flex w-full items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors",
          "aria-expanded": mobileOpen,
          "aria-controls": "toc-mobile-list",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-xs font-semibold uppercase tracking-widest text-muted-foreground", children: label }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "span",
              {
                className: cn(
                  "text-muted-foreground transition-transform duration-200",
                  mobileOpen && "rotate-180"
                ),
                children: chevron
              }
            )
          ]
        }
      ),
      mobileOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { id: "toc-mobile-list", className: "flex flex-col pb-2 border-t border-border/40", children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "a",
        {
          href: `#${item.id}`,
          onClick: (e) => {
            e.preventDefault();
            setMobileOpen(false);
            scrollTo(item.id);
          },
          className: cn(
            "block px-4 py-2 text-sm leading-snug transition-colors hover:text-foreground",
            item.level === 3 ? "pl-8 text-muted-foreground/70" : "text-muted-foreground"
          ),
          children: item.text
        }
      ) }, item.id)) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "nav",
      {
        "aria-label": label,
        className: cn(
          positionStyles[position],
          "max-h-[calc(100vh-7rem)] overflow-y-auto",
          "[&::-webkit-scrollbar]:w-0",
          "transition-opacity duration-300",
          "z-50",
          position !== "inline" ? ready ? "opacity-100" : "opacity-0" : "opacity-100",
          position !== "inline" && "w-52",
          className
        ),
        style: navStyle,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50 pl-6", children: label }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "relative", children: [
            svgPath && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
              "svg",
              {
                width: 20,
                height: svgH,
                className: "absolute top-0 left-0 pointer-events-none overflow-visible",
                "aria-hidden": true,
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("clipPath", { id: "toc-viewport-clip", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { ref: clipRectRef, x: -10, y: 0, width: 40, height: 0 }) }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "path",
                    {
                      d: svgPath,
                      fill: "none",
                      strokeWidth: 1.5,
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      style: { stroke: "var(--color-border, #e2e8f0)" }
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "path",
                    {
                      ref: fgPathRef,
                      d: svgPath,
                      fill: "none",
                      strokeWidth: 2,
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      clipPath: "url(#toc-viewport-clip)",
                      style: { stroke: "var(--color-primary, #3b82f6)" }
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { ref: dotGroupRef, transform: "translate(-100,-100)", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { r: 5.5, style: { fill: "var(--color-background, #ffffff)" } }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { r: 3, style: { fill: "var(--color-primary, #3b82f6)" } })
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { ref: listRef, className: "flex flex-col", children: items.map((item) => {
              const isActive = visibleIds.includes(item.id);
              return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "li",
                {
                  ref: (el) => {
                    if (el) itemRefs.current.set(item.id, el);
                    else itemRefs.current.delete(item.id);
                  },
                  children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "a",
                    {
                      href: `#${item.id}`,
                      onClick: (e) => {
                        e.preventDefault();
                        scrollTo(item.id);
                      },
                      className: cn(
                        "block py-1.5 text-[13px] leading-snug transition-colors duration-150 truncate",
                        item.level === 2 ? "pl-6" : "pl-9",
                        isActive ? "text-foreground font-medium" : "text-muted-foreground/70 hover:text-foreground"
                      ),
                      children: item.text
                    }
                  )
                },
                item.id
              );
            }) })
          ] })
        ]
      }
    )
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  LINE_X,
  TocNav,
  buildPath,
  docToSvgY,
  useTocNavigation
});
