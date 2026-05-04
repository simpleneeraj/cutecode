/**
 * SvgBlurBackdrop — html-to-image compatible glassmorphism layer
 *
 * CSS `backdrop-filter: blur()` is NOT supported by html-to-image because it
 * requires live compositor access to the underlying pixels.
 *
 * CSS `filter: blur()` applied to a *child element* IS supported.
 *
 * The trick:
 *   1. Inside the card (`overflow: hidden`), place an absolutely-positioned div
 *      that duplicates the outer frame's background-image.
 *   2. Apply `filter: blur(Xpx)` to that div (not backdrop-filter).
 *   3. The card's overflow:hidden clips the blurred edges cleanly — visually
 *      identical to backdrop-filter: blur().
 *   4. Use a ref on the card to measure its offset relative to the outer frame,
 *      then adjust `background-position` so the correct slice of the gradient /
 *      image is shown behind the card.
 *
 * Usage — drop inside any card div that has `position:relative; overflow:hidden`:
 *
 *   <div style={{ position:"relative", overflow:"hidden", borderRadius:20 }}>
 *     <SvgBlurBackdrop
 *       backgroundImage="linear-gradient(135deg, #7b1fa2, #1a237e)"
 *       blurAmount={20}
 *       tintColor="rgba(30,15,60,0.55)"
 *     />
 *     ...actual card content...
 *   </div>
 */

"use client";

import { useRef, useLayoutEffect, useState, CSSProperties } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SvgBlurBackdropProps {
  /**
   * The CSS `background-image` value of the outer frame wrapper.
   * Can be a gradient string or `url("/path/to/image.jpg")`.
   */
  backgroundImage: string;

  /** CSS background-size of the outer frame — default "cover" */
  backgroundSize?: string;

  /**
   * Gaussian blur amount in px — default 18.
   * The card must have `overflow: hidden` to clip the blurred edges.
   */
  blurAmount?: number;

  /**
   * Optional solid/semi-transparent tint layered on top of the blur.
   * This replaces (or supplements) the card's own background-color.
   * e.g. "rgba(18, 4, 8, 0.72)"
   */
  tintColor?: string;

  /** Extra box-shadow CSS applied to the tint layer (inner glow, etc.) */
  tintBoxShadow?: string;

  /** z-index of the backdrop layer — default 0 */
  zIndex?: number;

  /** Extra style overrides for the outer wrapper div */
  style?: CSSProperties;
}

// ─── Helper: find the nearest ancestor that carries a background ──────────────

/**
 * Walk up the DOM from `el` to find the first ancestor whose computed
 * backgroundImage is not "none". Returns that element or null.
 */
function findBackgroundAncestor(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node) {
    const bg = getComputedStyle(node).backgroundImage;
    if (bg && bg !== "none") return node;
    node = node.parentElement;
  }
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SvgBlurBackdrop({
  backgroundImage,
  backgroundSize = "cover",
  blurAmount = 18,
  tintColor,
  tintBoxShadow,
  zIndex = 0,
  style,
}: SvgBlurBackdropProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  // offset of this card relative to its background-carrying ancestor
  const [offset, setOffset] = useState<{ x: number; y: number; aw: number; ah: number } | null>(null);

  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    function measure() {
      if (!el) return;
      const ancestor = findBackgroundAncestor(el);
      if (!ancestor) return;
      const aRect = ancestor.getBoundingClientRect();
      const eRect = el.getBoundingClientRect();
      setOffset({
        x: eRect.left - aRect.left,
        y: eRect.top - aRect.top,
        aw: aRect.width,
        ah: aRect.height,
      });
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    // also observe the document root for padding changes
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, []);

  // ── Background-position offset ──────────────────────────────────────────
  // For `background-size: cover` with `background-position: center`, the
  // background image's top-left in the ancestor's coordinate space is at some
  // (imgOffsetX, imgOffsetY). We replicate that offset with a negative
  // margin / background-position on our inner blurred div.
  //
  // The simplest trick: set `background-position` to shift by (-offsetX, -offsetY)
  // so the card sees the same slice of the background as the parent.
  //
  // For gradients this must be exact. For images, we use the same cover logic.

  const bgPosition = offset !== null ? `calc(50% - ${offset.x}px) calc(50% - ${offset.y}px)` : "center center";

  // Extra spread to prevent hard edges from the Gaussian falloff at card edges.
  // The blurred div is expanded outward by `spread` px and then shifted back
  // so that it still aligns — this ensures the blur kernel has background
  // pixels to sample at every point near the card border.
  const spread = blurAmount * 2;

  const blurDivStyle: CSSProperties = {
    position: "absolute",
    inset: -spread,
    backgroundImage,
    backgroundSize,
    backgroundPosition: bgPosition,
    // 'filter' is correctly captured by html-to-image
    filter: `blur(${blurAmount}px)`,
    // Prevent the blurred div from receiving pointer events
    pointerEvents: "none",
  };

  const tintDivStyle: CSSProperties | undefined = tintColor
    ? {
        position: "absolute",
        inset: 0,
        backgroundColor: tintColor,
        boxShadow: tintBoxShadow,
        pointerEvents: "none",
      }
    : undefined;

  return (
    <div
      ref={wrapperRef}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        zIndex,
        pointerEvents: "none",
        ...style,
      }}
    >
      {/* Blurred background replica */}
      <div style={blurDivStyle} />

      {/* Optional tint/color overlay */}
      {tintDivStyle && <div style={tintDivStyle} />}
    </div>
  );
}
