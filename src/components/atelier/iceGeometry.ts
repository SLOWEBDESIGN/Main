import * as THREE from "three";

/** A genuine cuboid: two flat horizontal planes and four vertical walls. */
export function createIceColumn(width: number, height: number, depth: number) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const uv = geometry.getAttribute("uv");
  const position = geometry.getAttribute("position");
  // Where each point sits on its own face, in scene units, plus that face's size.
  // The block shader draws its seams from this, so the geometry stays a plain box.
  const face = new Float32Array(position.count * 4);
  for (let start = 0; start < position.count; start += 4) {
    const corners = [0, 1, 2, 3].map((k) => [
      position.getX(start + k),
      position.getY(start + k),
      position.getZ(start + k),
    ]);
    const axes = [0, 1, 2].filter(
      (axis) => new Set(corners.map((c) => c[axis].toFixed(5))).size > 1
    );
    const low = axes.map((axis) => Math.min(...corners.map((c) => c[axis])));
    const size = axes.map(
      (axis, k) => Math.max(...corners.map((c) => c[axis])) - low[k]
    );
    corners.forEach((corner, k) => {
      face.set(
        [corner[axes[0]] - low[0], corner[axes[1]] - low[1], size[0], size[1]],
        (start + k) * 4
      );
    });
  }
  geometry.setAttribute("aFace", new THREE.BufferAttribute(face, 4));
  // Keep frost grain square on tall columns instead of stretching it vertically.
  for (const side of [0, 1, 4, 5])
    for (let vertex = side * 4; vertex < side * 4 + 4; vertex++)
      uv.setY(vertex, (uv.getY(vertex) * height) / 2.4);
  return geometry;
}
