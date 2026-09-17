import { useId } from "react";
import {
  LOCKUP_RATIO,
  LOCKUP_VIEWBOX,
  MARK_PATH,
  MARK_RATIO,
  MARK_VIEWBOX,
  WORD_PATH,
} from "./logo-paths";

type LogoProps = {
  /** Full lockup, or the monogram alone for tight spaces. */
  variant?: "lockup" | "mark";
  /**
   * `brand` is the indigo-to-crimson mark with an indigo wordmark, for light
   * surfaces. `inverse` is solid white, for the indigo and void sections.
   */
  tone?: "brand" | "inverse";
  /** Rendered height in px. Width follows the lockup's own ratio. */
  height?: number;
  className?: string;
  title?: string;
};

/**
 * The logo, drawn rather than loaded.
 *
 * The only master the CMS holds is a 298x137 PNG, which was being scaled to a
 * 36px-tall header logo - soft on every screen, and visibly so on a retina
 * one. These are the same outlines as vectors, so the mark is exact at any
 * size, and the tone can flip between light and dark headers with no second
 * request and no swap flicker.
 *
 * The gradient id is per-instance: two logos on one page with a shared id
 * would make the second one inherit the first one's gradient.
 */
export function Logo({
  variant = "lockup",
  tone = "brand",
  height = 36,
  className,
  title = "WorldEmp",
}: LogoProps) {
  const gradientId = useId();
  const isMark = variant === "mark";
  const ratio = isMark ? MARK_RATIO : LOCKUP_RATIO;
  const inverse = tone === "inverse";

  return (
    <svg
      viewBox={isMark ? MARK_VIEWBOX : LOCKUP_VIEWBOX}
      width={Math.round(height * ratio * 100) / 100}
      height={height}
      role="img"
      aria-label={title}
      className={className}
    >
      {!inverse ? (
        <defs>
          {/* Sampled from the brand original: the mark ramps from
              --color-we-indigo at its left edge to --color-we-crimson at its
              right, across the mark's own bounding box. */}
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#150958" />
            <stop offset="1" stopColor="#bd2230" />
          </linearGradient>
        </defs>
      ) : null}
      <path
        d={MARK_PATH}
        fillRule="evenodd"
        fill={inverse ? "currentColor" : `url(#${gradientId})`}
      />
      {!isMark ? (
        <path
          d={WORD_PATH}
          fillRule="evenodd"
          fill={inverse ? "currentColor" : "#150958"}
        />
      ) : null}
    </svg>
  );
}
