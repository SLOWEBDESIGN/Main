import * as THREE from "three";

type Stone = {
  index: number;
  top: { x: number; y: number; z: number };
  width: number;
  depth: number;
  height: number;
};
type Point = [number, number, number];

/** The receiver stays here when the interactive stone leaves its socket. */
export function landingPoint(stone: Stone) {
  return { x: stone.top.x, y: stone.top.y - stone.height, z: stone.top.z };
}

/** A level bearing surface, fractured shoulders, and a deep quarry face. */
export function createQuarryLedge(width: number, depth: number, seed: number) {
  const random = (n: number) => {
    const v = Math.sin((seed + 1) * 127.1 + n * 311.7) * 43758.5453;
    return v - Math.floor(v);
  };
  const hw = width / 2 + 0.12,
    hd = depth / 2 + 0.12;
  const perimeter = [
    [-1, -1],
    [0, -1],
    [1, -1],
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
  ];
  const bearing: Point[] = perimeter.map(([x, z]) => [x * hw, 0, z * hd]);
  const shoulder: Point[] = perimeter.map(([x, z], i) => [
    x * (hw + 0.48 + random(i) * 0.38),
    -0.12 - random(i + 10) * 0.22,
    z * (hd + 0.48 + random(i + 20) * 0.38),
  ]);
  const fracture: Point[] = shoulder.map(([x, , z], i) => [
    x * (1.02 + random(i + 30) * 0.06),
    -0.85 - random(i + 40) * 0.42,
    z * (1.02 + random(i + 50) * 0.06),
  ]);
  const deep: Point[] = fracture.map(([x, , z], i) => [
    x * (1.05 + random(i + 60) * 0.13),
    -5.4 - random(i + 70) * 0.35,
    z * (1.05 + random(i + 80) * 0.13),
  ]);
  const positions: number[] = [],
    uvs: number[] = [],
    colors: number[] = [];
  let face = 0;
  const triangle = (a: Point, b: Point, c: Point) => {
    const normal = new THREE.Vector3().crossVectors(
      new THREE.Vector3(...b).sub(new THREE.Vector3(...a)),
      new THREE.Vector3(...c).sub(new THREE.Vector3(...a))
    );
    const top =
      Math.abs(normal.y) > Math.max(Math.abs(normal.x), Math.abs(normal.z));
    const shade = 0.84 + random(face++ + 100) * 0.16;
    for (const p of [a, b, c]) {
      positions.push(...p);
      uvs.push(
        (top || Math.abs(normal.z) > Math.abs(normal.x) ? p[0] : p[2]) / 2.8,
        (top ? p[2] : p[1]) / 2.8
      );
      colors.push(shade * 0.97, shade * 0.99, shade);
    }
  };
  for (let i = 0; i < 8; i++) {
    const j = (i + 1) % 8;
    triangle([0, 0, 0], bearing[j], bearing[i]);
    for (const [upper, lower] of [
      [bearing, shoulder],
      [shoulder, fracture],
      [fracture, deep],
    ]) {
      triangle(upper[i], upper[j], lower[i]);
      triangle(upper[j], lower[j], lower[i]);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

/** Static foreground scenery shares the sculpture's camera, so contact survives resize. */
export function createFoundation(
  stones: readonly Stone[],
  texture: THREE.Texture
) {
  const group = new THREE.Group();
  group.name = "quarry-foundation";
  const receivers = stones.map((stone) => {
    const impact = { value: 0 },
      contact = { value: 0 };
    const material = new THREE.MeshStandardMaterial({
      color: "#7f8b99",
      map: texture,
      bumpMap: texture,
      bumpScale: 0.16,
      roughness: 1,
      vertexColors: true,
      flatShading: true,
      transparent: true,
      depthWrite: false,
    });
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uGroundImpact = impact;
      shader.uniforms.uGroundHalf = {
        value: new THREE.Vector2(stone.width / 2, stone.depth / 2),
      };
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying vec3 vQuarry;"
        )
        .replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nvQuarry = position;"
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying vec3 vQuarry; uniform float uGroundImpact; uniform vec2 uGroundHalf;"
        )
        .replace(
          "#include <emissivemap_fragment>",
          `#include <emissivemap_fragment>
          float edge = max(abs(vQuarry.x) / uGroundHalf.x, abs(vQuarry.z) / uGroundHalf.y);
          float rim = smoothstep(0.9, 1.03, edge) * (1.0 - smoothstep(1.1, 1.6, edge));
          totalEmissiveRadiance += vec3(0.22, 0.27, 0.34) * rim * uGroundImpact * max(0.0, 1.0 + vQuarry.y * 3.0);
          // The deep quarry face disappears into the photographic valley's mist.
          diffuseColor.a *= 1.0 - smoothstep(1.8, 5.4, -vQuarry.y);`
        );
    };
    material.customProgramCacheKey = () => "atelier-quarry";
    // The two optical endpoints must have the same silhouette, just like the stones.
    const seed = stone.index === stones.length - 1 ? 0 : stone.index;
    const ledge = new THREE.Mesh(
      createQuarryLedge(stone.width, stone.depth, seed),
      material
    );
    const origin = landingPoint(stone);
    ledge.position.set(origin.x, origin.y, origin.z);
    ledge.receiveShadow = true;
    group.add(ledge);
    const shadowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uContact: contact,
        uHalf: { value: new THREE.Vector2(stone.width / 2, stone.depth / 2) },
      },
      vertexShader:
        "varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
      fragmentShader: `varying vec2 vUv; uniform float uContact; uniform vec2 uHalf;
        void main(){vec2 p=abs(vUv-0.5)*(uHalf*2.0+1.0);float d=max(p.x-uHalf.x,p.y-uHalf.y);
          float a=(1.0-smoothstep(-0.06,0.38,d))*uContact*0.38;
          gl_FragColor=vec4(0.07,0.10,0.14,a);}`,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
    });
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(stone.width + 1, stone.depth + 1),
      shadowMaterial
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(origin.x, origin.y + 0.012, origin.z);
    shadow.renderOrder = 2;
    group.add(shadow);
    return { ledge, shadow, impact, contact, origin };
  });
  return { group, receivers };
}
