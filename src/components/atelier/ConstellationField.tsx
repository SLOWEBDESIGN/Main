import { useEffect, useRef } from "react";

/**
 * A sky of faint stars, each joined to its five nearest neighbours, that stays hidden until
 * the pointer passes over it. Close to the pointer the lines and stars show, a little further
 * they are faint, and beyond that the sky is clear again. The stars never drift; only what
 * the pointer uncovers changes. The main constellation keeps a clear space around it.
 */
export default function ConstellationField({ interactive }: { interactive: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const host = canvas?.parentElement;
    if (!canvas || !context || !host) return;
    if (!interactive) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    type Star = { x: number; y: number; r: number; near: number[]; line: number; dot: number };
    let stars: Star[] = [];
    let width = 0,
      height = 0,
      frame = 0,
      rebuild = 0,
      pointerX = -1e4,
      pointerY = -1e4;
    const ink = "29, 38, 50";

    const draw = () => {
      frame = 0;
      let settling = false;
      for (const star of stars) {
        const d = (star.x - pointerX) ** 2 + (star.y - pointerY) ** 2;
        const [line, dot] =
          d < 4000 ? [0.34, 0.72] : d < 20000 ? [0.12, 0.34] : d < 40000 ? [0.03, 0.12] : [0, 0];
        star.line += (line - star.line) * 0.22;
        star.dot += (dot - star.dot) * 0.22;
        if (Math.abs(line - star.line) > 0.003 || Math.abs(dot - star.dot) > 0.003) settling = true;
        else {
          star.line = line;
          star.dot = dot;
        }
      }
      context.clearRect(0, 0, width, height);
      context.lineWidth = 0.8;
      for (const star of stars) {
        if (star.line <= 0.004) continue;
        context.strokeStyle = `rgba(${ink},${star.line.toFixed(3)})`;
        context.beginPath();
        for (const j of star.near) {
          context.moveTo(star.x, star.y);
          context.lineTo(stars[j].x, stars[j].y);
        }
        context.stroke();
      }
      for (const star of stars) {
        if (star.dot <= 0.004) continue;
        context.fillStyle = `rgba(${ink},${star.dot.toFixed(3)})`;
        context.beginPath();
        context.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        context.fill();
      }
      if (settling) frame = requestAnimationFrame(draw);
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    const build = () => {
      rebuild = 0;
      width = host.clientWidth;
      height = host.clientHeight;
      if (!width || !height) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const box = host.getBoundingClientRect();
      const keep = document
        .querySelector(".atelier-design-constellation")
        ?.getBoundingClientRect();
      const cell = width < 700 ? 54 : 72;
      stars = [];
      for (let x = 0; x < width; x += cell)
        for (let y = 0; y < height; y += cell) {
          const sx = x + Math.random() * cell,
            sy = y + Math.random() * cell;
          if (
            keep &&
            sx > keep.left - box.left - 28 &&
            sx < keep.right - box.left + 28 &&
            sy > keep.top - box.top - 28 &&
            sy < keep.bottom - box.top + 28
          )
            continue;
          stars.push({ x: sx, y: sy, r: 0.9 + Math.random() * 1.5, near: [], line: 0, dot: 0 });
        }
      stars.forEach((star, i) => {
        star.near = stars
          .map((other, j) => ({ j, d: (other.x - star.x) ** 2 + (other.y - star.y) ** 2 }))
          .filter((other) => other.j !== i)
          .sort((a, b) => a.d - b.d)
          .slice(0, 5)
          .map((other) => other.j);
      });
      wake();
    };

    const move = (event: PointerEvent) => {
      const box = host.getBoundingClientRect();
      pointerX = event.clientX - box.left;
      pointerY = event.clientY - box.top;
      wake();
    };
    const leave = () => {
      pointerX = pointerY = -1e4;
      wake();
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    window.addEventListener("blur", leave);
    const resize = new ResizeObserver(() => {
      clearTimeout(rebuild);
      rebuild = window.setTimeout(build, 160);
    });
    resize.observe(host);
    build();
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("blur", leave);
      resize.disconnect();
      clearTimeout(rebuild);
      cancelAnimationFrame(frame);
    };
  }, [interactive]);

  return <canvas ref={canvasRef} className="atelier-constellation-field" aria-hidden="true" />;
}
