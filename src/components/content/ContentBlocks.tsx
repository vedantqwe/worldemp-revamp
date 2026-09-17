import Image from "next/image";
import type { Block } from "@/lib/pages";

/**
 * Renders migrated CMS content in the revamp's type scale.
 *
 * The scraper reduces every page to an ordered list of blocks, so this is the
 * one place that decides how a heading, a paragraph, a pull quote or a figure
 * looks. Measure is capped at ~68 characters for body copy while figures and
 * tables are allowed to break out, which is why each block sets its own width
 * rather than the container setting one for all of them.
 */

/**
 * Body measure. Left-aligned on the page gutter rather than centred in the
 * viewport, so the copy sits on the same vertical line as the masthead above
 * it instead of stepping inwards halfway down the page.
 */
const MEASURE = "max-w-[42rem]";

export function ContentBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8">
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} index={i} />
      ))}
    </div>
  );
}

function BlockView({ block, index }: { block: Block; index: number }) {
  switch (block.type) {
    case "heading": {
      // The H1 is the page masthead, so body headings start at H2 and the
      // CMS's own nesting is flattened into two visible levels.
      const Tag = block.level <= 2 ? "h2" : "h3";
      const isMajor = Tag === "h2";
      return (
        <Tag
          className={`${MEASURE} text-balance font-display leading-[1.15] text-we-ink ${
            isMajor
              ? "mt-16 text-[clamp(1.5rem,2.6vw,2.1rem)] first:mt-0"
              : "mt-10 text-[clamp(1.2rem,2vw,1.5rem)] first:mt-0"
          }`}
        >
          {block.text}
        </Tag>
      );
    }

    case "text":
      return (
        <p className={`${MEASURE} mt-5 text-[1.0625rem] leading-[1.75] text-we-ink/80 first:mt-0`}>
          {block.text}
        </p>
      );

    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      return (
        <Tag className={`${MEASURE} mt-6 space-y-2.5 text-[1.0625rem] leading-[1.7] text-we-ink/80`}>
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span
                aria-hidden
                className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-we-magenta"
              >
                {block.ordered ? null : null}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </Tag>
      );
    }

    case "quote":
      return (
        <blockquote
          className={`${MEASURE} mt-12 border-l-2 border-we-magenta pl-6 font-display text-[clamp(1.25rem,2.4vw,1.75rem)] leading-[1.3] text-we-ink`}
        >
          {block.text}
        </blockquote>
      );

    case "image":
      return (
        <figure className="mt-12 max-w-[56rem]">
          <Image
            src={block.src}
            alt={block.alt}
            width={block.width}
            height={block.height}
            sizes="(min-width: 64rem) 56rem, 100vw"
            // The first image on a page is usually the one above the fold.
            priority={index < 2}
            className="h-auto w-full rounded-3xl border border-we-line object-cover"
          />
          {block.alt ? (
            <figcaption className="mt-3 max-w-[42rem] text-xs leading-relaxed text-we-muted">
              {block.alt}
            </figcaption>
          ) : null}
        </figure>
      );

    case "stats":
      // The figures the case pages lead with. Set as a row of numbered cells
      // so they read as a summary rather than as three stray subheadings.
      return (
        <dl className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-we-line bg-we-line sm:grid-cols-3">
          {block.items.map((stat, i) => (
            <div key={stat.label} className="bg-white p-7">
              <span
                aria-hidden
                className="we-gradient flex h-9 w-9 items-center justify-center rounded-full font-display text-sm font-semibold text-white"
              >
                {i + 1}
              </span>
              <dt className="mt-5 font-display text-lg leading-snug text-we-ink">{stat.label}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-we-muted">{stat.value}</dd>
            </div>
          ))}
        </dl>
      );

    case "table":
      return (
        <div className="mt-12 max-w-[56rem] overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r} className="border-b border-we-line align-top">
                  {row.map((cell, c) => (
                    <td
                      key={c}
                      className={`py-4 pr-6 leading-relaxed ${
                        r === 0 ? "font-display font-semibold text-we-ink" : "text-we-ink/80"
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    default:
      return null;
  }
}
