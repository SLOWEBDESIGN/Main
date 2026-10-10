import { useEffect, useRef, type CSSProperties } from "react";

/**
 * WEB over DESIGN as one constellation, set the way a star atlas prints one: solid stars
 * graded by brightness, hairlines that stop just short of each star, and a faceted alphabet
 * in which every corner is cut at the same 45 degrees, so all nine letters share one
 * construction. It plots itself in as the hero is revealed and then holds still.
 */

// Letters on a grid 80 tall, y down. Each stroke is a run of stars joined by lines.
const GLYPHS: Record<string, { width: number; strokes: number[][][] }> = {
  W: { width: 54, strokes: [[[0, 0], [13, 80], [27, 30], [41, 80], [54, 0]]] },
  E: { width: 46, strokes: [[[46, 0], [0, 0], [0, 40], [0, 80], [46, 80]], [[0, 40], [34, 40]]] },
  B: {
    width: 50,
    strokes: [
      [[0, 80], [0, 0], [36, 0], [48, 12], [48, 28], [36, 40], [0, 40]],
      [[36, 40], [50, 52], [50, 68], [38, 80], [0, 80]],
    ],
  },
  D: { width: 50, strokes: [[[0, 0], [32, 0], [50, 18], [50, 62], [32, 80], [0, 80], [0, 0]]] },
  S: {
    width: 50,
    strokes: [[[50, 12], [38, 0], [12, 0], [0, 12], [0, 28], [12, 40], [38, 40], [50, 52], [50, 68], [38, 80], [12, 80], [0, 68]]],
  },
  I: { width: 26, strokes: [[[0, 0], [26, 0]], [[13, 0], [13, 80]], [[0, 80], [26, 80]]] },
  G: {
    width: 50,
    strokes: [[[50, 12], [38, 0], [12, 0], [0, 12], [0, 68], [12, 80], [38, 80], [50, 68], [50, 44], [28, 44]]],
  },
  N: { width: 50, strokes: [[[0, 80], [0, 0], [50, 80], [50, 0]]] },
};
const ROWS = ["WEB", "DESIGN"];
const TRACKING = 30;
const LEADING = 124;
/** Letters whose first star is one of the bright ones. */
const BRIGHT = new Set([0, 3, 5, 8]);
const RADIUS = { 1: 3.4, 2: 2.4, 3: 1.5 } as const;
/** The clear space between a line's end and the star it reaches. */
const GAP = 2.8;

const r2 = (n: number) => Math.round(n * 100) / 100;

type Star = { x: number; y: number; mag: 1 | 2 | 3; delay: number };
type Segment = { x1: number; y1: number; x2: number; y2: number; delay: number };
type Letter = { stars: Star[]; segments: Segment[]; cx: number; cy: number };

const letters: Letter[] = [];
let chartWidth = 0;
{
  let clock = 0.15,
    index = 0;
  ROWS.forEach((word, row) => {
    let x = 0;
    for (const character of word) {
      const glyph = GLYPHS[character];
      const ox = x,
        oy = row * LEADING;
      const stars = new Map<string, Star>();
      const at = ([px, py]: number[]) => [ox + px, oy + py] as const;
      // A corner cut is a short 45-degree run; its two stars are the faint ones.
      const cut = (a: number[], b: number[]) =>
        Math.abs(Math.abs(b[0] - a[0]) - Math.abs(b[1] - a[1])) < 0.5 && Math.hypot(b[0] - a[0], b[1] - a[1]) < 20;
      const segments: Segment[] = [];
      glyph.strokes.forEach((stroke) => {
        stroke.forEach((point, k) => {
          const [sx, sy] = at(point);
          const key = `${sx},${sy}`;
          const faint =
            (k > 0 && cut(stroke[k - 1], point)) || (k < stroke.length - 1 && cut(point, stroke[k + 1]));
          // Each star lights as its first line reaches it.
          if (!stars.has(key))
            stars.set(key, { x: sx, y: sy, mag: faint ? 3 : 2, delay: k === 0 ? clock : clock + 0.22 });
          if (k === 0) return;
          const [px, py] = at(stroke[k - 1]);
          segments.push({ x1: px, y1: py, x2: sx, y2: sy, delay: r2(clock) });
          const reached = stars.get(key)!;
          reached.delay = Math.min(reached.delay, r2(clock + 0.22));
          clock += 0.035;
        });
      });
      const list = [...stars.values()];
      if (BRIGHT.has(index)) list[0].mag = 1;
      // Lines stop short of the stars at both ends.
      const radiusAt = (x: number, y: number) => RADIUS[stars.get(`${x},${y}`)!.mag];
      const trimmed = segments.map((s) => {
        const length = Math.hypot(s.x2 - s.x1, s.y2 - s.y1);
        const ux = (s.x2 - s.x1) / length,
          uy = (s.y2 - s.y1) / length;
        const a = radiusAt(s.x1, s.y1) + GAP,
          b = radiusAt(s.x2, s.y2) + GAP;
        return {
          x1: r2(s.x1 + ux * a),
          y1: r2(s.y1 + uy * a),
          x2: r2(s.x2 - ux * b),
          y2: r2(s.y2 - uy * b),
          delay: s.delay,
        };
      });
      letters.push({
        stars: list.map((s) => ({ ...s, delay: r2(s.delay) })),
        segments: trimmed,
        cx: r2(ox + glyph.width / 2),
        cy: r2(oy + 40),
      });
      x += glyph.width + TRACKING;
      index++;
      clock += 0.06;
    }
    chartWidth = Math.max(chartWidth, x - TRACKING);
  });
}
const PAD = 14;
const viewBox = `${-PAD} ${-PAD} ${chartWidth + PAD * 2} ${LEADING + 80 + PAD * 2}`;

const vars = (values: Record<string, string | number>) => values as CSSProperties;

export default function DesignConstellation({ interactive }: { interactive: boolean }) {
  const svg = useRef<SVGSVGElement>(null);

  // Stars near the pointer brighten a touch, and the letter under it firms up.
  useEffect(() => {
    const element = svg.current;
    if (!element || !interactive) return;
    const starNodes = [...element.querySelectorAll<SVGGElement>("[data-star]")];
    const letterNodes = [...element.querySelectorAll<SVGGElement>("[data-letter]")];
    const points = starNodes.map((node) => ({ x: +node.dataset.x!, y: +node.dataset.y! }));
    const centers = letterNodes.map((node) => ({ x: +node.dataset.cx!, y: +node.dataset.cy! }));
    let frame = 0,
      clientX = -1e4,
      clientY = -1e4;
    const update = () => {
      frame = 0;
      const matrix = element.getScreenCTM();
      if (!matrix) return;
      const local = new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse());
      starNodes.forEach((node, i) => {
        const near = Math.max(0, 1 - Math.hypot(points[i].x - local.x, points[i].y - local.y) / 60);
        node.style.setProperty("--near", (near * near).toFixed(3));
      });
      letterNodes.forEach((node, i) => {
        const near = Math.max(0, 1 - Math.hypot(centers[i].x - local.x, centers[i].y - local.y) / 80);
        node.style.setProperty("--near", near.toFixed(3));
      });
    };
    const move = (event: PointerEvent) => {
      clientX = event.clientX;
      clientY = event.clientY;
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(frame);
      [...starNodes, ...letterNodes].forEach((node) => node.style.removeProperty("--near"));
    };
  }, [interactive]);

  return (
    <svg
      ref={svg}
      className="atelier-design-constellation"
      viewBox={viewBox}
      role="img"
      aria-label="Web design, drawn as a constellation of stars"
    >
      {letters.map((letter, l) => (
        <g key={l} className="c-letter" data-letter data-cx={letter.cx} data-cy={letter.cy}>
          {letter.segments.map((segment, s) => (
            <line
              key={s}
              className="c-line"
              x1={segment.x1}
              y1={segment.y1}
              x2={segment.x2}
              y2={segment.y2}
              pathLength={1}
              style={vars({ "--d": `${r2(segment.delay * 0.08)}s` })}
            />
          ))}
          {letter.stars.map((star, k) => (
            <g
              key={k}
              className={`c-star c-mag-${star.mag}`}
              data-star
              data-x={star.x}
              data-y={star.y}
              transform={`translate(${star.x} ${star.y})`}
              style={vars({ "--d": `${r2(star.delay * 0.08)}s` })}
            >
              {star.mag === 1 && (
                <path className="c-cross" d="M -10 0 H -5.5 M 5.5 0 H 10 M 0 -10 V -5.5 M 0 5.5 V 10" />
              )}
              <circle className="c-dot" r={RADIUS[star.mag]} />
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}
