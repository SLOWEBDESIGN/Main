import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";

// Mechanical extraction from the owner's supplied binary STL. No model vertices
// are guessed: each upward-facing rectangle becomes an independent ice module.
const filename = path.resolve(
  "public/media/hero/models/penrose-stairs-source.stl"
);
const bytes = fs.readFileSync(filename);
const triangles = bytes.readUInt32LE(80);
if (bytes.length !== 84 + triangles * 50)
  throw new Error("Expected a binary STL");
const tops = new Map();
let floor = Infinity;
for (let i = 0; i < triangles; i++) {
  const offset = 84 + i * 50;
  const vertices = Array.from({ length: 3 }, (_, v) =>
    Array.from({ length: 3 }, (_, a) =>
      bytes.readFloatLE(offset + 12 + v * 12 + a * 4)
    )
  );
  floor = Math.min(floor, ...vertices.map((v) => v[1]));
  const a = vertices[1].map((v, j) => v - vertices[0][j]);
  const b = vertices[2].map((v, j) => v - vertices[0][j]);
  const ny = a[2] * b[0] - a[0] * b[2];
  if (
    ny <= 0.01 ||
    Math.max(...vertices.map((v) => v[1])) -
      Math.min(...vertices.map((v) => v[1])) >
      0.001
  )
    continue;
  const height = Math.round(vertices[0][1] * 1000) / 1000;
  const bounds = tops.get(height) ?? {
    min: [Infinity, height, Infinity],
    max: [-Infinity, height, -Infinity],
  };
  for (const v of vertices)
    for (const axis of [0, 2]) {
      bounds.min[axis] = Math.min(bounds.min[axis], v[axis]);
      bounds.max[axis] = Math.max(bounds.max[axis], v[axis]);
    }
  tops.set(height, bounds);
}
const modules = [...tops.values()]
  .sort((a, b) => a.max[1] - b.max[1])
  .map((bounds, index) => ({
    index,
    min: bounds.min.map((v, axis) =>
      axis === 1 ? floor : Number(v.toFixed(4))
    ),
    max: bounds.max.map((v) => Number(v.toFixed(4))),
    top: bounds.min.map((v, axis) =>
      Number((axis === 1 ? v : (v + bounds.max[axis]) / 2).toFixed(4))
    ),
  }));
if (modules.length !== 13)
  throw new Error(`Unexpected top count: ${modules.length}`);
const first = modules[0].top,
  last = modules.at(-1).top;
const sightline = last.map((value, axis) =>
  Number((value - first[axis]).toFixed(4))
);
const model = {
  source: "Penrose Stairs.stl",
  sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
  triangles,
  floor,
  sightline,
  modules,
};
fs.writeFileSync(
  "src/data/penrose-model.json",
  JSON.stringify(model, null, 2) + "\n"
);
console.log(
  JSON.stringify(
    {
      source: model.source,
      triangles,
      modules: modules.length,
      first,
      last,
      sightline,
      sha256: model.sha256,
    },
    null,
    2
  )
);
