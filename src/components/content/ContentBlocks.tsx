import Image from "next/image";
import { CardGrid } from "@/components/content/CardGrid";
import { Reveal } from "@/components/ui/Reveal";
import { cardsFor, type Block } from "@/lib/pages";
import type { Locale } from "@/lib/i18n";

/**
 * Renders migrated CMS content in the revamp's type scale.
 *
 * The scraper reduces every page to an ordered list of blocks, so this is the
 * one place that decides how a heading, a paragraph, a pull quote or a figure
 * looks. Measure is capped at ~68 characters for body copy while figures and
 * tables are allowed to break out, which is why each block sets its own width
 * rather than the container setting one for all of them.
 *
 * Pictures are the exception, and they get a pass of their own before
 * anything renders - see `layout()`.
 */

/**
 * Body measure. Left-aligned on the page gutter rather than centred in the
 * viewport, so the copy sits on the same vertical line as the masthead above
 * it instead of stepping inwards halfway down the page.
 */
const MEASURE = "max-w-[42rem]";

/** The narrower measure a picture sits beside. */
const COLUMN = "max-w-[34rem]";

type ImageBlock = Extract<Block, { type: "image" }>;

/** Blocks that read well in a half-width column next to a picture. */
const PAIRABLE = new Set(["heading", "text", "list", "quote"]);

/** How many blocks a picture may take with it into a split. */
const MAX_PAIRED = 3;

type Unit =
  | { kind: "prose"; blocks: Block[] }
  /** A picture and the paragraphs it belongs to, side by side. */
  | { kind: "split"; blocks: Block[]; image: ImageBlock; flip: boolean }
  /** A picture with no prose to sit beside: a full-measure band. */
  | { kind: "band"; image: ImageBlock }
  /** Pictures the CMS put back to back. */
  | { kind: "gallery"; images: ImageBlock[] };

/**
 * Groups the flat block list into layout units.
 *
 * The CMS emits pictures as siblings of the paragraphs around them, so
 * rendering the list as it comes gives a column of text interrupted by
 * full-width photographs - the stacked-slab look, where every picture is the
 * same size in the same place and the page has no rhythm.
 *
 * What the consultancies do instead is set a picture beside the passage it
 * belongs to and alternate which side it falls on, keeping full width for the
 * ones that earn it. That is a layout decision, not a content one, so it is
 * made here rather than in the scraper: the blocks stay a faithful record of
 * the page and this decides how they sit.
 */
function layout(blocks: Block[]): Unit[] {
  const units: Unit[] = [];
  let buffer: Block[] = [];
  let splits = 0;

  const flush = () => {
    if (buffer.length) units.push({ kind: "prose", blocks: buffer });
    buffer = [];
  };

  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i];
    if (block.type !== "image") {
      buffer.push(block);
      continue;
    }

    // Take the whole run, so two pictures in a row become a pair rather than
    // two bands with a hairline of white between them.
    const run: ImageBlock[] = [];
    while (i < blocks.length && blocks[i].type === "image") {
      run.push(blocks[i] as ImageBlock);
      i += 1;
    }
    i -= 1;

    if (run.length > 1) {
      flush();
      units.push({ kind: "gallery", images: run });
      continue;
    }

    // The passage just above, but only as much of it as reads in a column,
    // and only blocks that survive being narrowed - a table or a card grid
    // beside a photograph is two cramped things instead of one good one.
    let take = 0;
    while (
      take < MAX_PAIRED &&
      take < buffer.length &&
      PAIRABLE.has(buffer[buffer.length - 1 - take].type)
    ) {
      take += 1;
    }

    if (take > 0) {
      const tail = buffer.slice(buffer.length - take);
      buffer = buffer.slice(0, buffer.length - take);
      flush();
      units.push({ kind: "split", blocks: tail, image: run[0], flip: splits % 2 === 1 });
      splits += 1;
      continue;
    }

    // Nothing above to pair with - a picture that opens a page, say. Look at
    // what follows instead, so it leads the passage rather than floating.
    const ahead: Block[] = [];
    let j = i + 1;
    while (j < blocks.length && ahead.length < MAX_PAIRED && PAIRABLE.has(blocks[j].type)) {
      ahead.push(blocks[j]);
      j += 1;
    }

    flush();
    if (ahead.length) {
      units.push({ kind: "split", blocks: ahead, image: run[0], flip: splits % 2 === 1 });
      splits += 1;
      i = j - 1;
    } else {
      units.push({ kind: "band", image: run[0] });
    }
  }

  flush();
  return units;
}

/**
 * Which units hold one of the first two pictures on the page - the ones worth
 * loading eagerly. Worked out in one pass up front rather than counted during
 * render, which would be a mutation the renderer is not allowed.
 */
function eagerUnits(units: Unit[]): boolean[] {
  let seen = 0;
  return units.map((unit) => {
    const eager = seen < 2;
    seen += unit.kind === "gallery" ? unit.images.length : unit.kind === "prose" ? 0 : 1;
    return eager;
  });
}

export function ContentBlocks({ blocks, locale }: { blocks: Block[]; locale: Locale }) {
  const units = layout(blocks);
  const eagerly = eagerUnits(units);

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8">
      {units.map((unit, u) => {
        switch (unit.kind) {
          case "prose":
            return (
              // Each block carries its own top margin, but the first one in a
              // unit has to give it up or the unit double-spaces. That leaves
              // the unit itself to separate it from what came before - which
              // matters most on a phone, where a split stacks and its picture
              // would otherwise butt straight into the next heading.
              <div key={u} className={`[&>*:first-child]:mt-0 ${u === 0 ? "" : "mt-16"}`}>
                {unit.blocks.map((block, i) => (
                  <BlockView key={i} block={block} locale={locale} />
                ))}
              </div>
            );

          case "split":
            return (
              <Reveal key={u} className="mt-20 first:mt-0" y={28}>
                <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                  <div className={`${COLUMN} [&>*:first-child]:mt-0 ${unit.flip ? "lg:order-2" : ""}`}>
                    {unit.blocks.map((block, i) => (
                      <BlockView key={i} block={block} locale={locale} />
                    ))}
                  </div>
                  <Figure
                    image={unit.image}
                    priority={eagerly[u]}
                    sizes="(min-width: 64rem) 36rem, 100vw"
                    className={unit.flip ? "lg:order-1" : ""}
                  />
                </div>
              </Reveal>
            );

          case "band":
            return (
              <Reveal key={u} className="mt-16 first:mt-0" y={28}>
                <Figure
                  image={unit.image}
                  priority={eagerly[u]}
                  sizes="(min-width: 64rem) 56rem, 100vw"
                  className="max-w-[56rem]"
                />
              </Reveal>
            );

          case "gallery":
            return (
              <Reveal key={u} className="mt-16 first:mt-0" y={28}>
                <div className="grid gap-5 sm:grid-cols-2">
                  {unit.images.map((image, i) => (
                    <Figure
                      key={i}
                      image={image}
                      priority={eagerly[u] && i === 0}
                      sizes="(min-width: 40rem) 32rem, 100vw"
                    />
                  ))}
                </div>
              </Reveal>
            );
        }
      })}
    </div>
  );
}

/**
 * One picture.
 *
 * The migrated images arrive in every shape the CMS allowed - 410x410 next to
 * 1600x900 - so nothing is cropped to a house ratio: a diagram survives being
 * letterboxed far worse than a photograph survives being its own shape. What
 * is shared is the frame, the radius and the slow lift on hover, which is
 * what makes a page of mixed pictures look like one page.
 */
function Figure({
  image,
  priority,
  sizes,
  className = "",
}: {
  image: ImageBlock;
  priority: boolean;
  sizes: string;
  className?: string;
}) {
  return (
    <figure className={className}>
      <span className="block overflow-hidden rounded-3xl border border-we-line bg-we-paper">
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes={sizes}
          priority={priority}
          className="h-auto w-full transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03] motion-reduce:transition-none motion-reduce:hover:scale-100"
        />
      </span>
      {image.alt ? (
        <figcaption className="mt-3 text-xs leading-relaxed text-we-muted">{image.alt}</figcaption>
      ) : null}
    </figure>
  );
}

function BlockView({ block, locale }: { block: Block; locale: Locale }) {
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
              ? "mt-16 text-[clamp(1.5rem,2.6vw,2.1rem)]"
              : "mt-10 text-[clamp(1.2rem,2vw,1.5rem)]"
          }`}
        >
          {block.text}
        </Tag>
      );
    }

    case "text":
      return (
        <p className={`${MEASURE} mt-5 text-[1.0625rem] leading-[1.75] text-we-ink/80`}>
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
              />
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
      // Pictures are grouped into their own units before rendering, so a
      // stray one here would be a bug in `layout()` rather than content.
      return null;

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
              {/* Some cells have no figure against them on the live site. An
                  empty cell keeps the row; an empty line under the label does
                  not need rendering. */}
              {stat.value ? (
                <dd className="mt-1.5 text-sm leading-relaxed text-we-muted">{stat.value}</dd>
              ) : null}
            </div>
          ))}
        </dl>
      );

    case "cards": {
      // A grid of links the CMS put on the page. Rendering the site's own
      // cards means the "Read more" on each one goes somewhere, which is more
      // than the flattened bullet list it replaced could say.
      const cards = cardsFor(block.routes, locale);
      if (!cards.length) return null;
      return (
        <div className="mt-14">
          <CardGrid locale={locale} cards={cards} columns={3} />
        </div>
      );
    }

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
