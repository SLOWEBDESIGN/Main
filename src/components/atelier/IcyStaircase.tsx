import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createGlowingMan, type ManPose } from "./glowingMan";
import { createIceColumn } from "./iceGeometry";
import {
  advanceRunner,
  isAirborne,
  newRunner,
  type RunnerMode,
} from "./runner";
import {
  CAMERA_DIRECTION,
  COLUMN_GENERATORS,
  ICE_MODULES,
  MODULE_COUNT,
  SCREEN_RIGHT,
  SCREEN_UP,
  SLOT_COUNT,
  STAIR_COUNT,
  introFrame,
  pushOffset,
  runnerPose,
  seamDisplay,
  slotCenter,
  slotFacing,
  slotOf,
  stairPoint,
  stoneEntrance,
  type HeroPhase,
} from "./heroScene";

export type HeroStatus = RunnerMode | "loose";

type Props = {
  paused: boolean;
  reduced: boolean;
  light: boolean;
  skipIntro: boolean;
  interactive: boolean;
  onState: (status: HeroStatus) => void;
  onPhase: (phase: HeroPhase) => void;
  onUnavailable: () => void;
};

/** A cold, fractured stone surface. The snow is a separate top material. */
function frostTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  const pixels = ctx.createImageData(512, 512);
  let seed = 18271;
  const hash = (x: number, y: number) => {
    const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return value - Math.floor(value);
  };
  const noise = (x: number, y: number, size: number) => {
    const gx = x / size,
      gy = y / size;
    const ix = Math.floor(gx),
      iy = Math.floor(gy);
    const fx = gx - ix,
      fy = gy - iy;
    const sx = fx * fx * (3 - 2 * fx),
      sy = fy * fy * (3 - 2 * fy);
    const upper = hash(ix, iy) * (1 - sx) + hash(ix + 1, iy) * sx;
    const lower = hash(ix, iy + 1) * (1 - sx) + hash(ix + 1, iy + 1) * sx;
    return upper * (1 - sy) + lower * sy;
  };
  for (let y = 0; y < 512; y++)
    for (let x = 0; x < 512; x++) {
      seed = (seed * 16807) % 2147483647;
      const grain = seed / 2147483647;
      const ridge =
        noise(x, y, 49) * 0.4 +
        noise(x, y, 17) * 0.32 +
        noise(x, y, 6) * 0.18 +
        noise(x, y, 2) * 0.1;
      const value = 154 + ridge * 85 + grain * 24;
      const i = (y * 512 + x) * 4;
      pixels.data[i] = value - 1;
      pixels.data[i + 1] = value;
      pixels.data[i + 2] = value + 3;
      pixels.data[i + 3] = 255;
    }
  ctx.putImageData(pixels, 0, 0);
  ctx.strokeStyle = "rgba(61,76,99,.13)";
  ctx.lineWidth = 0.75;
  for (let j = 0; j < 18; j++) {
    ctx.beginPath();
    let x = (j * 83.7) % 512,
      y = (j * 61.3) % 512;
    ctx.moveTo(x, y);
    for (let k = 0; k < 7; k++) {
      x += Math.sin(j * 4 + k * 2.3) * 26;
      y += 10 + Math.cos(k + j) * 18;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

type BlockLight = {
  glow: { value: number };
  flash: { value: number };
  /** Moves the block toward the camera in depth only, so it draws over its neighbours. */
  push: { value: number };
};
type Occluder = {
  matrix: { value: THREE.Matrix4 };
  half: { value: THREE.Vector3 };
  on: { value: number };
};
const SEAM_COLOR = new THREE.Color("#d8eaff");
const restSeam = { value: 0.3 };
const viewDirection = {
  value: new THREE.Vector3(
    CAMERA_DIRECTION.x,
    CAMERA_DIRECTION.y,
    CAMERA_DIRECTION.z
  ).normalize(),
};
const noOccluder: Occluder = {
  matrix: { value: new THREE.Matrix4() },
  half: { value: new THREE.Vector3() },
  on: { value: 0 },
};

/**
 * Ice blocks in the igloo manner: every face edge carries a thin seam of cold light,
 * as if lit from inside, that flares when the block is knocked loose or lands. The
 * shape stays a plain box; the seams are drawn from each face's own coordinates.
 */
function blockMaterial(
  base: THREE.MeshPhysicalMaterial,
  light: BlockLight,
  occluder: Occluder = noOccluder
) {
  const material = base.clone();
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uGlow = light.glow;
    shader.uniforms.uFlash = light.flash;
    shader.uniforms.uSeam = restSeam;
    shader.uniforms.uSeamColor = { value: SEAM_COLOR };
    shader.uniforms.uOccluder = occluder.matrix;
    shader.uniforms.uOccluderHalf = occluder.half;
    shader.uniforms.uOccluderOn = occluder.on;
    shader.uniforms.uViewDir = viewDirection;
    shader.uniforms.uPush = light.push;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nattribute vec4 aFace;\nvarying vec4 vFace;\nvarying vec3 vOccWorld;\nuniform float uPush;"
      )
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvFace = aFace;\nvOccWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;"
      )
      .replace(
        "#include <project_vertex>",
        "#include <project_vertex>\ngl_Position.z -= uPush * gl_Position.w;"
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec4 vFace;\nvarying vec3 vOccWorld;\nuniform float uGlow, uFlash, uSeam, uOccluderOn;\nuniform vec3 uSeamColor, uOccluderHalf, uViewDir;\nuniform mat4 uOccluder;"
      )
      .replace(
        "#include <map_fragment>",
        `// The join module is drawn in front of the next tread, but in the picture it sits
  // behind it. Wherever the next tread, carried along the sightline to the join, covers
  // this fragment, drop it so the real tread behind shows through.
  if (uOccluderOn > 0.5) {
    vec3 origin = (uOccluder * vec4(vOccWorld, 1.0)).xyz;
    vec3 ray = (uOccluder * vec4(uViewDir, 0.0)).xyz + 1e-5;
    vec3 t0 = (-uOccluderHalf - origin) / ray, t1 = (uOccluderHalf - origin) / ray;
    vec3 near = min(t0, t1), far = max(t0, t1);
    float enter = max(max(near.x, near.y), near.z), leave = min(min(far.x, far.y), far.z);
    if (leave > max(enter, 1e-4)) discard;
  }
  #include <map_fragment>
  float faceEdge = min(min(vFace.x, vFace.z - vFace.x), min(vFace.y, vFace.w - vFace.y));
  diffuseColor.rgb *= 0.8 + 0.2 * smoothstep(0.015, 0.2, faceEdge);`
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
  float seamLine = 1.0 - smoothstep(0.008, 0.008 + fwidth(faceEdge) * 1.7, faceEdge);
  float seamBand = 1.0 - smoothstep(0.0, 0.32, faceEdge);
  totalEmissiveRadiance += uSeamColor * (seamLine * (uSeam + 1.5 * uGlow + 2.6 * uFlash)
    + seamBand * seamBand * (0.45 * uGlow + 1.0 * uFlash));`
      );
  };
  material.customProgramCacheKey = () => "atelier-ice-block";
  return material;
}

/** Frost dust thrown off by an impact. Sized in scene units, drawn as soft discs. */
function createDust(capacity: number) {
  const geometry = new THREE.BufferGeometry();
  const position = new Float32Array(capacity * 3),
    alpha = new Float32Array(capacity),
    size = new Float32Array(capacity);
  geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
  geometry.setAttribute("aAlpha", new THREE.BufferAttribute(alpha, 1));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uScale: { value: 60 },
      uColor: { value: new THREE.Color("#eef4fc") },
    },
    vertexShader: `attribute float aAlpha; attribute float aSize; uniform float uScale; varying float vAlpha;
      void main() { vAlpha = aAlpha; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_PointSize = aSize * uScale; }`,
    fragmentShader: `uniform vec3 uColor; varying float vAlpha;
      void main() { float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard; gl_FragColor = vec4(uColor, vAlpha * (1.0 - smoothstep(0.1, 0.5, d))); }`,
    transparent: true,
    depthWrite: false,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  points.renderOrder = 10;
  const velocity = new Float32Array(capacity * 3),
    age = new Float32Array(capacity).fill(1),
    life = new Float32Array(capacity).fill(1),
    base = new Float32Array(capacity);
  let cursor = 0,
    live = 0;
  const emit = (
    x: number,
    y: number,
    z: number,
    vx: number,
    vy: number,
    vz: number,
    span: number,
    grain: number
  ) => {
    const i = cursor;
    cursor = (cursor + 1) % capacity;
    points.visible = true;
    position.set([x, y, z], i * 3);
    velocity.set([vx, vy, vz], i * 3);
    age[i] = 0;
    life[i] = span;
    base[i] = grain;
  };
  const step = (dt: number) => {
    if (!live && !points.visible) return;
    live = 0;
    const drag = Math.exp(-dt * 2.6);
    for (let i = 0; i < capacity; i++) {
      if (age[i] >= life[i]) {
        alpha[i] = 0;
        continue;
      }
      live++;
      age[i] += dt;
      const t = Math.min(1, age[i] / life[i]);
      velocity[i * 3] *= drag;
      velocity[i * 3 + 2] *= drag;
      velocity[i * 3 + 1] = velocity[i * 3 + 1] * drag - 5.5 * dt;
      position[i * 3] += velocity[i * 3] * dt;
      position[i * 3 + 1] += velocity[i * 3 + 1] * dt;
      position[i * 3 + 2] += velocity[i * 3 + 2] * dt;
      alpha[i] = 0.62 * (1 - t) ** 1.6 * Math.min(1, age[i] * 30);
      size[i] = base[i] * (0.7 + t * 0.9);
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.aAlpha.needsUpdate = true;
    geometry.attributes.aSize.needsUpdate = true;
    points.visible = live > 0;
  };
  return { points, emit, step, material, geometry, active: () => live > 0 };
}

/** The runner's size against a tread, and how far above his feet his light sits. */
const RUNNER_SCALE = 1.55;
const LANTERN_HEIGHT = 0.3 * RUNNER_SCALE;

export default function IcyStaircase(props: Props) {
  const host = useRef<HTMLDivElement>(null),
    settings = useRef(props);
  settings.current = props;
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      setFailed(true);
      settings.current.onPhase("ready");
      settings.current.onUnavailable();
      return;
    }
    const scene = new THREE.Scene();
    // The imported model is physically open. Its last/first sections overlap
    // naturally along this extracted sightline, with normal depth testing.
    const camera = new THREE.OrthographicCamera(-12, 12, 8, -8, 0.1, 180);
    const direction = new THREE.Vector3(
      CAMERA_DIRECTION.x,
      CAMERA_DIRECTION.y,
      CAMERA_DIRECTION.z
    ).normalize();
    const right = new THREE.Vector3(
        SCREEN_RIGHT.x,
        SCREEN_RIGHT.y,
        SCREEN_RIGHT.z
      ),
      up = new THREE.Vector3(SCREEN_UP.x, SCREEN_UP.y, SCREEN_UP.z);
    // Frame the assembled loop by its outline in the picture plane. Moving the
    // camera across that plane is a pure translation of the image.
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    for (const module of ICE_MODULES)
      for (const sx of [-0.5, 0.5])
        for (const sz of [-0.5, 0.5])
          for (const dy of [0, -module.height]) {
            const corner = new THREE.Vector3(
              module.top.x + sx * module.width,
              module.top.y + dy,
              module.top.z + sz * module.depth
            );
            minX = Math.min(minX, corner.dot(right));
            maxX = Math.max(maxX, corner.dot(right));
            minY = Math.min(minY, corner.dot(up));
            maxY = Math.max(maxY, corner.dot(up));
          }
    const outline = { width: maxX - minX, height: maxY - minY };
    const target = right
      .clone()
      .multiplyScalar((minX + maxX) / 2)
      .addScaledVector(up, (minY + maxY) / 2);
    camera.position.copy(target).addScaledVector(direction, 55);
    camera.lookAt(target);
    camera.updateMatrixWorld();
    // How far one scene unit of depth moves a point in clip space.
    const ndcPerUnit = 2 / (camera.far - camera.near);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.94;
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(renderer.domElement);
    // Tracking marks for loose blocks live on their own flat layer above the scene.
    const hud = document.createElement("canvas");
    hud.className = "atelier-scene-hud";
    hud.setAttribute("aria-hidden", "true");
    container.appendChild(hud);
    const marks = hud.getContext("2d");

    const texture = frostTexture();
    const iceBase = new THREE.MeshPhysicalMaterial({
      color: "#b7bdc9",
      map: texture,
      bumpMap: texture,
      bumpScale: 0.065,
      roughness: 0.73,
      metalness: 0,
      clearcoat: 0.2,
      clearcoatRoughness: 0.4,
    });
    // A shade darker than the walls' light, so the glowing runner reads brightest on them.
    const snowBase = new THREE.MeshPhysicalMaterial({
      color: "#a8b0bd",
      map: texture,
      bumpMap: texture,
      bumpScale: 0.018,
      roughness: 0.62,
      metalness: 0.02,
      clearcoat: 0.6,
      clearcoatRoughness: 0.32,
      emissive: "#c3e4ff",
      emissiveIntensity: 0,
    });
    const hemisphere = new THREE.HemisphereLight("#dce4f0", "#758192", 1.4);
    scene.add(hemisphere);
    const sun = new THREE.DirectionalLight("#f6f9ff", 1.9);
    sun.position.set(-11, 24, -10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(
      window.innerWidth < 700 ? 1024 : 2048,
      window.innerWidth < 700 ? 1024 : 2048
    );
    Object.assign(sun.shadow.camera, {
      left: -18,
      right: 18,
      top: 20,
      bottom: -20,
      near: 0.1,
      far: 65,
    });
    sun.shadow.bias = -0.0003;
    sun.shadow.normalBias = 0.025;
    sun.shadow.radius = 4;
    scene.add(sun);
    const fill = new THREE.DirectionalLight("#e5ecf5", 0.7);
    fill.position.copy(direction).multiplyScalar(30);
    scene.add(fill);
    // Light from inside the staircase, spilling out of whichever gap is open.
    const socketLight = new THREE.PointLight("#cfe4ff", 0, 6, 1.5);
    scene.add(socketLight);

    // The second tread, moved along the sightline to sit beside the join module.
    const nextTread: Occluder = {
      matrix: { value: new THREE.Matrix4() },
      half: {
        value: new THREE.Vector3(
          ICE_MODULES[1].width / 2,
          ICE_MODULES[1].height / 2,
          ICE_MODULES[1].depth / 2
        ),
      },
      on: { value: 0 },
    };
    const joinShift = new THREE.Matrix4().makeTranslation(
      ICE_MODULES[STAIR_COUNT].top.x - ICE_MODULES[0].top.x,
      ICE_MODULES[STAIR_COUNT].top.y - ICE_MODULES[0].top.y,
      ICE_MODULES[STAIR_COUNT].top.z - ICE_MODULES[0].top.z
    );
    const blocks = ICE_MODULES.map((module) => {
      const light: BlockLight = {
        glow: { value: 0 },
        flash: { value: 0 },
        push: { value: 0 },
      };
      const occluder = module.index === STAIR_COUNT ? nextTread : noOccluder;
      const ice = blockMaterial(iceBase, light, occluder),
        snow = blockMaterial(snowBase, light, occluder);
      // The join module's outgoing wall is its own material so it can be left open.
      const wall =
        module.index === STAIR_COUNT
          ? blockMaterial(iceBase, light, occluder)
          : ice;
      const mesh = new THREE.Mesh(
        createIceColumn(module.width, module.height, module.depth),
        [ice, ice, snow, ice, wall, ice]
      );
      mesh.castShadow = mesh.receiveShadow = true;
      // The pivot sits at the column's center, so a loose block turns about itself.
      const pivot = new THREE.Group();
      pivot.position.y = -module.height / 2;
      pivot.add(mesh);
      const group = new THREE.Group();
      group.position.set(module.top.x, module.top.y, module.top.z);
      group.visible = false;
      group.add(pivot);
      scene.add(group);
      return { module, group, pivot, mesh, light, wall, landed: false };
    });
    const dust = createDust(720);
    scene.add(dust.points);

    // Slot geometry in the picture plane, measured once at rest. A stone's outline is a
    // hexagon; `centers` are the middles of those hexagons.
    const centers = Array.from({ length: SLOT_COUNT }, (_, slot) =>
      slotCenter(slot)
    );
    const loopCenter = centers.reduce(
      (sum, p) => ({
        x: sum.x + p.x / SLOT_COUNT,
        y: sum.y + p.y / SLOT_COUNT,
      }),
      { x: 0, y: 0 }
    );
    const slots = centers.map((_, slot) => {
      // Each stone slides straight out of its own place in the loop, like a drawer, so it
      // can pass in front of or behind a neighbour but never through it.
      const facing = slotFacing(slot);
      const slide = pushOffset(1, facing);
      const across = new THREE.Vector3(slide.x, slide.y, slide.z);
      const picture = { x: across.dot(right), y: across.dot(up) };
      const size = Math.hypot(picture.x, picture.y) || 1;
      return {
        /** How far it has slid out, as a share of `PUSH_REACH`. */
        push: 0,
        speed: 0,
        target: 0,
        facing,
        /** The slide as the camera sees it, for the runner's fall. */
        direction: { x: picture.x / size, y: picture.y / size },
        track: 0,
        scramble: 0,
        offset: new THREE.Vector3(),
      };
    });

    // The joined module's depth, which the first module borrows while it stands in for it.
    const joinDepth = new THREE.Vector3()
      .setFromMatrixPosition(joinShift)
      .length();
    const columnDrop = COLUMN_GENERATORS[1].y;

    const character = new THREE.Group();
    scene.add(character);
    character.visible = false;
    // A man made of light. He always outshines the stones; his lamp lights them as he passes.
    const man = createGlowingMan();
    const figure = man.figure;
    character.add(figure);
    man.halo.scale.setScalar(RUNNER_SCALE);
    scene.add(man.halo);
    const lantern = new THREE.PointLight("#ffb766", 6, 4.2, 1.6);
    const joinLantern = new THREE.PointLight("#ffb766", 0, 4.2, 1.6);
    scene.add(lantern, joinLantern);

    let state = newRunner(),
      lastStatus: HeroStatus | null = null,
      lastPhase: HeroPhase | null = null;
    let time = 0,
      previous = 0,
      raf = 0,
      visible = true,
      disposed = false,
      introDone = false,
      closedAt = -1,
      settledFrames = 0,
      lastSettings = "",
      shake = 0,
      shakeAge = 0,
      landingSquash = 0,
      lanternFlash = 0,
      hudDrawn = false;
    const fallStart = new THREE.Vector3(),
      fallDrift = new THREE.Vector3();
    const pointer = { x: 0, y: 0, active: false };
    const onContextLost = (event: Event) => {
      event.preventDefault();
      setFailed(true);
      cancelAnimationFrame(raf);
      settings.current.onPhase("ready");
      settings.current.onUnavailable();
    };
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);
    const frame = { halfWidth: 12, halfHeight: 8, offsetX: 0, offsetY: 0 };
    const frameCamera = () => {
      const w = container.clientWidth,
        h = container.clientHeight;
      if (!w || !h) return;
      const aspect = w / h;
      if (w < 700) {
        // Phones: fit the loop in the band between the headline and the hint below it.
        const bandTop = h * 0.37,
          band = Math.max(h - 250 - bandTop, h * 0.3);
        const units = Math.max(
          outline.width / (w * 0.58),
          outline.height / Math.min(band, h * 0.35)
        );
        frame.halfWidth = (w / 2) * units;
        frame.halfHeight = (h / 2) * units;
        frame.offsetX = -frame.halfWidth * 0.28;
        frame.offsetY = (bandTop + band / 2 - h / 2) * units;
      } else {
        frame.halfHeight = Math.max(
          outline.height / 2 / 0.5,
          outline.width / 2 / 0.42 / aspect
        );
        frame.halfWidth = frame.halfHeight * aspect;
        frame.offsetX = -frame.halfWidth * 0.46;
        frame.offsetY = frame.halfHeight * 0.045;
      }
    };
    const applyCamera = (jitterX: number, jitterY: number) => {
      // Translation only, never rotation: framing and shake cannot touch the seam.
      const x = frame.offsetX + jitterX,
        y = frame.offsetY + jitterY;
      camera.left = -frame.halfWidth + x;
      camera.right = frame.halfWidth + x;
      camera.top = frame.halfHeight + y;
      camera.bottom = -frame.halfHeight + y;
      camera.updateProjectionMatrix();
    };
    const resize = () => {
      const w = container.clientWidth,
        h = container.clientHeight;
      if (!w || !h) return;
      frameCamera();
      applyCamera(0, 0);
      renderer.setSize(w, h);
      const ratio = Math.min(window.devicePixelRatio, 2);
      hud.width = Math.round(w * ratio);
      hud.height = Math.round(h * ratio);
      marks?.setTransform(ratio, 0, 0, ratio, 0, 0);
      hudDrawn = true;
      settledFrames = 0;
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { rootMargin: "100px" }
    );
    observer.observe(container);

    const place = (event: PointerEvent) => {
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
    };
    const move = (event: PointerEvent) => {
      if (!settings.current.interactive) return;
      place(event);
      pointer.active = true;
    };
    const release = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") pointer.active = false;
    };
    const leave = () => {
      pointer.active = false;
    };
    renderer.domElement.addEventListener("pointerdown", move);
    renderer.domElement.addEventListener("pointermove", move);
    renderer.domElement.addEventListener("pointerleave", leave);
    renderer.domElement.addEventListener("pointerup", release);
    renderer.domElement.addEventListener("pointercancel", leave);
    window.addEventListener("blur", leave);

    const project = new THREE.Vector3();
    const toScreen = (point: THREE.Vector3) => {
      project.copy(point).project(camera);
      return {
        x: ((project.x + 1) / 2) * container.clientWidth,
        y: ((1 - project.y) / 2) * container.clientHeight,
      };
    };
    const impact = (block: (typeof blocks)[number], power: number) => {
      block.light.flash.value = 1;
      shake = Math.max(shake, power);
      shakeAge = 0;
      const { width, depth } = block.module;
      const origin = block.module.top;
      const count = Math.round(55 + power * 330);
      for (let n = 0; n < count; n++) {
        // A brief frost pulse as the levitating blocks settle into their sockets.
        const ground = false;
        const side = n % 4;
        const along = Math.random() - 0.5;
        const ex = side < 2 ? along * width : (side === 2 ? -0.5 : 0.5) * width;
        const ez = side < 2 ? (side === 0 ? -0.5 : 0.5) * depth : along * depth;
        const out = 1.4 + Math.random() * 3.2;
        const nx = side < 2 ? along * 0.6 : side === 2 ? -1 : 1;
        const nz = side < 2 ? (side === 0 ? -1 : 1) : along * 0.6;
        dust.emit(
          origin.x + ex,
          origin.y + 0.025,
          origin.z + ez,
          nx * out,
          ground ? 0.35 + Math.random() * 0.8 : 0.6 + Math.random() * 2.4,
          nz * out,
          (ground ? 0.75 : 0.55) + Math.random() * 0.75,
          (ground ? 0.15 : 0.05) + Math.random() * 0.15
        );
      }
    };
    const puff = (at: THREE.Vector3) => {
      for (let n = 0; n < 14; n++) {
        const angle = (n / 14) * Math.PI * 2;
        dust.emit(
          at.x,
          at.y + 0.02,
          at.z,
          Math.cos(angle) * 1.1,
          0.3 + Math.random() * 0.6,
          Math.sin(angle) * 1.1,
          0.4 + Math.random() * 0.3,
          0.03 + Math.random() * 0.04
        );
      }
    };

    // Rest point of a slot's tread, moved with its loose block.
    const supportOffset = (slot: number) => slots[slot].offset;
    const respawnTread = (progress: number) => {
      const from = Math.floor(progress) + 1;
      for (let k = 0; k < SLOT_COUNT * 2; k++) {
        const tread = from + k;
        const here = slots[slotOf(tread % STAIR_COUNT)],
          next = slots[slotOf((tread + 1) % STAIR_COUNT)];
        if (Math.max(here.push, here.target, next.push, next.target) < 0.04)
          return tread;
      }
      return from;
    };

    const drawMarks = (active: number[]) => {
      if (!marks) return;
      const w = container.clientWidth,
        h = container.clientHeight;
      if (!active.length) {
        if (hudDrawn) marks.clearRect(0, 0, w, h);
        hudDrawn = false;
        return;
      }
      marks.clearRect(0, 0, w, h);
      hudDrawn = true;
      const points = active.map((slot) => {
        const module =
          ICE_MODULES[
            slot === 0 && blocks[STAIR_COUNT].group.visible ? STAIR_COUNT : slot
          ];
        const tread = new THREE.Vector3(
          module.top.x,
          module.top.y,
          module.top.z
        ).add(slots[slot].offset);
        return { slot, ...toScreen(tread), alpha: slots[slot].track };
      });
      // Chain the marks around the loop so the lines never cross the middle.
      const center = toScreen(
        right
          .clone()
          .multiplyScalar(loopCenter.x)
          .addScaledVector(up, loopCenter.y)
      );
      points.sort(
        (a, b) =>
          Math.atan2(a.y - center.y, a.x - center.x) -
          Math.atan2(b.y - center.y, b.x - center.x)
      );
      let gap = 0,
        start = 0;
      points.forEach((point, i) => {
        const next = points[(i + 1) % points.length];
        let span =
          Math.atan2(next.y - center.y, next.x - center.x) -
          Math.atan2(point.y - center.y, point.x - center.x);
        if (span <= 0) span += Math.PI * 2;
        if (span > gap) {
          gap = span;
          start = (i + 1) % points.length;
        }
      });
      const chain = points.slice(start).concat(points.slice(0, start));
      marks.lineWidth = 1;
      for (let i = 1; i < chain.length; i++) {
        const a = chain[i - 1],
          b = chain[i];
        marks.strokeStyle = `rgba(238,245,255,${
          Math.min(a.alpha, b.alpha) * 0.55
        })`;
        marks.beginPath();
        marks.moveTo(a.x, a.y);
        marks.lineTo(b.x, b.y);
        marks.stroke();
      }
      marks.font = '500 10px ui-monospace, "SF Mono", Menlo, monospace';
      marks.textAlign = "right";
      marks.textBaseline = "bottom";
      for (const point of chain) {
        const color = `rgba(240,246,255,${point.alpha * 0.92})`;
        marks.strokeStyle = color;
        marks.fillStyle = color;
        marks.beginPath();
        marks.moveTo(point.x - 5, point.y);
        marks.lineTo(point.x + 5, point.y);
        marks.moveTo(point.x, point.y - 5);
        marks.lineTo(point.x, point.y + 5);
        marks.stroke();
        const label =
          slots[point.slot].scramble > 0
            ? String(Math.floor(Math.random() * 90) + 10)
            : String(point.slot + 1).padStart(2, "0");
        marks.fillText(label, point.x - 6, point.y - 5);
      }
    };

    const loop = (stamp: number) => {
      if (disposed) return;
      raf = requestAnimationFrame(loop);
      const dt = Math.min((stamp - previous) / 1000 || 0, 0.045);
      previous = stamp;
      const s = settings.current,
        staticScene = s.paused || s.reduced,
        instant = s.reduced || s.skipIntro;
      if (!visible || document.hidden) {
        if (instant && lastPhase !== "ready") {
          lastPhase = "ready";
          s.onPhase("ready");
        }
        return;
      }
      const signature = `${s.paused}:${s.reduced}:${s.light}:${s.skipIntro}`;
      if (signature !== lastSettings) {
        settledFrames = 0;
        lastSettings = signature;
      }
      if (staticScene && introDone && settledFrames++ > 75) return;
      if (!staticScene) {
        settledFrames = 0;
        time += dt;
      }
      const intro = introFrame(time, instant || introDone);
      if (lastPhase !== intro.phase) {
        lastPhase = intro.phase;
        s.onPhase(intro.phase);
      }
      if (intro.running && !introDone) {
        introDone = true;
        state = { ...newRunner(), mode: "running", arrival: 1 };
      }

      // Stones: each drops, stops dead, and shakes everything when it lands.
      const quick = instant || introDone;
      blocks.forEach((block, i) => {
        const entrance = stoneEntrance(i, time, quick);
        block.group.visible = entrance.visible;
        if (entrance.landed && !block.landed) {
          block.landed = true;
          if (!quick && i !== 0) {
            const last = i === STAIR_COUNT;
            impact(block, last ? 0.2 : 0.075);
            if (last) {
              closedAt = time;
              // Nothing casts shadows once the loop is closed; render the empty map once.
              renderer.shadowMap.autoUpdate = false;
              renderer.shadowMap.needsUpdate = true;
            }
          }
        }
        block.light.flash.value *= Math.exp(-dt * 4.2);
        if (closedAt >= 0) {
          // The closing stone sends one pulse of light around the whole loop.
          const delay =
            (slotOf(i) || (i === STAIR_COUNT ? 0 : SLOT_COUNT)) * 0.055;
          const since = time - closedAt - delay;
          if (since > 0 && since < 1.2)
            block.light.flash.value = Math.max(
              block.light.flash.value,
              0.75 * Math.exp(-since * 4.5)
            );
        }
        block.mesh.castShadow = !block.landed || closedAt < 0 ? !quick : false;
        block.group.position.set(
          block.module.top.x,
          block.module.top.y + entrance.offset,
          block.module.top.z
        );
        block.pivot.rotation.set(
          entrance.tilt * Math.sin(i * 2.3) * 0.25,
          entrance.tilt * Math.cos(i * 1.8) * 0.2,
          entrance.tilt * Math.cos(i) * 0.25
        );
      });
      if (quick && closedAt < 0) {
        closedAt = -2;
        renderer.shadowMap.autoUpdate = false;
        renderer.shadowMap.needsUpdate = true;
      }

      // Hover: the stone under the pointer and its neighbours round the ring are thrown
      // clear of one another, and spring back when the pointer moves on.
      if (!s.interactive) pointer.active = false;
      const w = container.clientWidth,
        h = container.clientHeight;
      const reach = (frame.halfWidth * 2) / w;
      const px =
          (pointer.x - w / 2) * reach +
          frame.offsetX +
          camera.position.dot(right),
        py =
          -(pointer.y - h / 2) * reach +
          frame.offsetY +
          camera.position.dot(up);
      const interactive = s.interactive && introDone && !staticScene;
      let strongest = 0,
        nearest = -1;
      slots.forEach((slot, i) => {
        const c = centers[i];
        let influence = 0;
        if (pointer.active && interactive) {
          // Distance to the column as drawn: a vertical stroke from the tread down.
          const dx = px - c.x,
            dy =
              py -
              Math.max(c.y - columnDrop / 2, Math.min(c.y + columnDrop / 2, py));
          const distance = Math.hypot(dx, dy * 0.85);
          influence = 1 - THREE.MathUtils.smoothstep(distance, 0.55, 3.3);
        }
        slot.target = influence;
        if (influence > strongest) {
          strongest = influence;
          nearest = i;
        }
        const before = slot.push;
        const stiffness = influence > slot.push ? 120 : 210;
        const damping =
          2 * Math.sqrt(stiffness) * (influence > slot.push ? 0.78 : 0.5);
        slot.speed +=
          (stiffness * (influence - slot.push) - damping * slot.speed) * dt;
        slot.push += slot.speed * dt;
        if (slot.push < 0) {
          // Back in its socket: it stops hard, with a small knock if it came in fast.
          if (before > 0.05 && slot.speed < -2.4) {
            const owner =
              blocks[
                i === 0 && blocks[STAIR_COUNT].group.visible ? STAIR_COUNT : i
              ];
            owner.light.flash.value = Math.max(owner.light.flash.value, 0.45);
            shake = Math.max(shake, 0.018);
            shakeAge = 0;
          }
          slot.push = 0;
          slot.speed = Math.max(0, slot.speed);
        }
        if (!interactive) {
          slot.push = 0;
          slot.speed = 0;
        }
        const amount = Math.min(1.25, slot.push);
        const bob = amount * 0.05 * Math.sin(time * 2.2 + i * 1.7);
        const offset = pushOffset(amount, slot.facing);
        slot.offset.set(offset.x, offset.y + bob, offset.z);
        const tracked =
          amount > 0.1 ? THREE.MathUtils.smoothstep(amount, 0.1, 0.38) : 0;
        if (tracked > 0 && slot.track === 0) slot.scramble = 0.32;
        slot.track = tracked;
        slot.scramble = Math.max(0, slot.scramble - dt);
      });
      renderer.domElement.style.cursor = strongest > 0.45 ? "crosshair" : "";
      const seam = seamDisplay(Math.max(0, slots[0].push));
      blocks.forEach((block, i) => {
        const slot = slots[slotOf(i)];
        if (!block.landed) return;
        block.group.position.add(slot.offset);
        const amount = Math.min(1.25, slot.push);
        // Level as it slides: a tilt would swing its corners into its neighbours.
        block.pivot.quaternion.identity();
        const neighbours = Math.max(
          slots[(slotOf(i) + 1) % SLOT_COUNT].push,
          slots[(slotOf(i) + SLOT_COUNT - 1) % SLOT_COUNT].push
        );
        block.light.glow.value = Math.min(
          1.2,
          amount * 1.05 + neighbours * 0.35
        );
        // While the first module stands in for the join it is drawn at the join's depth, so
        // it sits in front of and behind exactly what the join did. Every other stone keeps
        // its true depth: some slide out over their neighbours, some behind them.
        block.light.push.value =
          i === 0 && !seam.join ? joinDepth * ndcPerUnit : 0;
      });
      // Only one half of the join is drawn once its slot is loose.
      const join = blocks[STAIR_COUNT];
      if (join.landed) {
        join.group.visible = seam.join;
        join.wall.visible = seam.joinWall;
      } else join.wall.visible = true;
      nextTread.on.value = join.landed && blocks[1].landed ? 1 : 0;
      if (nextTread.on.value) {
        blocks[1].mesh.updateWorldMatrix(true, false);
        nextTread.matrix.value
          .multiplyMatrices(joinShift, blocks[1].mesh.matrixWorld)
          .invert();
      }
      let loosest = 0,
        socketWeight = 0;
      const socket = new THREE.Vector3();
      slots.forEach((slot, i) => {
        const weight = slot.push * slot.push;
        if (weight > 0) {
          const top = ICE_MODULES[i].top;
          socket.add(
            new THREE.Vector3(
              top.x,
              top.y - ICE_MODULES[i].height * 0.35,
              top.z
            ).multiplyScalar(weight)
          );
          socketWeight += weight;
        }
        loosest = Math.max(loosest, slot.push);
      });
      if (socketWeight > 0)
        socketLight.position.copy(socket.divideScalar(socketWeight));
      socketLight.intensity = Math.min(1, loosest) * 22;

      // The runner: dropped in by the intro, then running until a stone goes.
      const pose = runnerPose(state.progress);
      const supportSlot =
        state.mode === "running" && isAirborne(state.progress)
          ? slotOf((pose.index + 1) % STAIR_COUNT)
          : slotOf(pose.landing);
      const unsupported = introDone && slots[supportSlot].push > 0.06;
      if (introDone) {
        const before = state.mode;
        state = advanceRunner(
          state,
          dt,
          unsupported,
          staticScene,
          state.mode === "falling" ? respawnTread(state.progress) : undefined
        );
        if (state.mode === "falling" && before !== "falling") {
          fallStart.copy(character.position);
          fallDrift
            .set(Math.sin(pose.heading), 0, Math.cos(pose.heading))
            .multiplyScalar(0.45)
            .addScaledVector(right, slots[supportSlot].direction.x * 0.3)
            .addScaledVector(up, slots[supportSlot].direction.y * 0.3);
        }
        if (before === "arriving" && state.mode === "running") {
          landingSquash = 1;
          lanternFlash = 1;
          shake = Math.max(shake, 0.02);
          shakeAge = 0;
          puff(character.position);
        }
      }
      const status: HeroStatus =
        state.mode === "running" && loosest > 0.25 ? "loose" : state.mode;
      if (introDone && status !== lastStatus) {
        lastStatus = status;
        s.onState(status);
      }
      character.visible = intro.runnerVisible;
      const after = runnerPose(state.progress);
      landingSquash = Math.max(0, landingSquash - dt * 6);
      lanternFlash = Math.max(0, lanternFlash - dt * 2.5);
      figure.scale.set(
        RUNNER_SCALE * (1 + landingSquash * 0.12),
        RUNNER_SCALE * (1 - landingSquash * 0.2),
        RUNNER_SCALE * (1 + landingSquash * 0.12)
      );
      figure.rotation.set(0, 0, 0);
      let manPose: ManPose = "running";
      if (!introDone) {
        // Arrive on the visible top of the optical join, not behind its wall.
        character.position.copy(stairPoint(STAIR_COUNT));
        character.position.y += 18 * (1 - intro.arrival * intro.arrival);
        character.rotation.set(0, Math.PI / 2, 0);
        manPose = intro.arrival < 0.97 ? "dropping" : "standing";
      } else if (state.mode === "falling") {
        const f = state.fall;
        character.position
          .copy(fallStart)
          .addScaledVector(fallDrift, f)
          .add(new THREE.Vector3(0, 0.9 * f - 11 * f * f, 0));
        figure.rotation.set(f * 2.1, 0, f * 1.3);
        manPose = "falling";
      } else {
        character.position.set(
          after.visiblePoint.x,
          after.visiblePoint.y,
          after.visiblePoint.z
        );
        character.position.add(supportOffset(slotOf(after.landing)));
        if (state.mode === "arriving") {
          const a = state.arrival;
          character.position.y += 18 * (1 - a * a);
        }
        character.rotation.set(0, after.heading, 0);
        if (state.mode === "arriving")
          manPose = state.arrival < 0.97 ? "dropping" : "standing";
        else if (staticScene) manPose = "standing";
      }
      man.pose(manPose, state.progress, time, staticScene ? 1 : dt);
      // The bloom sits a little toward the camera, so the tread he stands on cannot cut it.
      man.halo.visible = character.visible;
      man.halo.position
        .copy(character.position)
        .addScaledVector(direction, 1.2);
      man.halo.position.y += 0.29 * RUNNER_SCALE;
      const ordinaryRun =
        introDone && state.mode === "running" && loosest < 0.015;
      lantern.position.copy(character.position);
      lantern.position.y += LANTERN_HEIGHT;
      joinLantern.position.copy(lantern.position);
      // A light this close to the stone would outshine the runner himself, so it
      // only reaches full strength once he is clear of the treads, falling or dropping.
      const clearance =
        state.mode === "falling"
          ? 1
          : THREE.MathUtils.smoothstep(
              character.position.y - after.visiblePoint.y,
              0.15,
              2.2
            );
      const lanternPower =
        (character.visible ? THREE.MathUtils.lerp(2.4, 6, clearance) : 0) *
        (1 + lanternFlash * 0.8);
      lantern.intensity = lanternPower;
      joinLantern.intensity = 0;
      if (ordinaryRun && after.index === 0) {
        lantern.position.set(
          after.point.x,
          after.point.y + LANTERN_HEIGHT,
          after.point.z
        );
        joinLantern.position
          .copy(lantern.position)
          .add(stairPoint(STAIR_COUNT) as THREE.Vector3)
          .sub(stairPoint(0) as THREE.Vector3);
        lantern.intensity = lanternPower * (1 - after.fold);
        joinLantern.intensity = lanternPower * after.fold;
      }
      // At the join the runner belongs to the front module, whatever its depth says.
      man.setDepthTest(
        introDone && (state.mode === "falling" || after.index !== 0)
      );

      // Impacts: a short downward jolt of the whole frame, then the dust settles.
      shakeAge += dt;
      shake *= Math.exp(-dt * 9);
      const decay = Math.exp(-shakeAge * 16);
      applyCamera(
        shake * 0.4 * Math.sin(shakeAge * 61) * decay,
        shake * Math.cos(shakeAge * 44) * decay
      );
      dust.step(dt);
      dust.material.uniforms.uScale.value =
        renderer.domElement.height / (frame.halfHeight * 2);
      drawMarks(slots.flatMap((slot, i) => (slot.track > 0.01 ? [i] : [])));

      renderer.toneMappingExposure = THREE.MathUtils.damp(
        renderer.toneMappingExposure,
        s.light ? 0.98 : 0.9,
        4,
        dt
      );
      Object.assign(container.dataset, {
        phase: intro.phase,
        interactive: String(s.interactive),
        runner: state.mode,
        visibleSteps: String(
          blocks.filter((block) => block.group.visible).length
        ),
        landedSteps: String(blocks.filter((block) => block.landed).length),
        runnerVisible: String(character.visible),
        elapsed: time.toFixed(2),
        progress: state.progress.toFixed(3),
        airborne: String(isAirborne(state.progress)),
        model: "supplied-penrose-stl",
        modules: String(MODULE_COUNT),
        geometry: "flat-cuboids",
        columnHeight: String(ICE_MODULES[0].height),
        ground: "none-levitating",
        groundReceivers: "0",
        loose: loosest.toFixed(3),
        picked: String(nearest),
        thrown: String(slots.filter((slot) => slot.push > 0.1).length),
        joinDrawn: String(join.group.visible),
        runnerX: character.position.x.toFixed(3),
        runnerY: character.position.y.toFixed(3),
        runnerZ: character.position.z.toFixed(3),
        joinLight: joinLantern.intensity.toFixed(3),
      });
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener(
        "webglcontextlost",
        onContextLost
      );
      renderer.domElement.removeEventListener("pointerdown", move);
      renderer.domElement.removeEventListener("pointermove", move);
      renderer.domElement.removeEventListener("pointerleave", leave);
      renderer.domElement.removeEventListener("pointerup", release);
      renderer.domElement.removeEventListener("pointercancel", leave);
      window.removeEventListener("blur", leave);
      const geometries = new Set<THREE.BufferGeometry>(),
        materials = new Set<THREE.Material>();
      scene.traverse((object) => {
        if (
          object instanceof THREE.Mesh ||
          object instanceof THREE.Sprite ||
          object instanceof THREE.Points
        ) {
          if (!(object instanceof THREE.Sprite))
            geometries.add(object.geometry);
          (Array.isArray(object.material)
            ? object.material
            : [object.material]
          ).forEach((material) => materials.add(material));
        }
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      iceBase.dispose();
      snowBase.dispose();
      texture.dispose();
      man.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      hud.remove();
    };
  }, []);
  return (
    <div
      className="atelier-scene"
      ref={host}
      data-scene={failed ? "fallback" : "webgl"}
    >
      {failed && (
        <div className="atelier-scene-fallback">
          <picture>
            <source
              media="(max-width: 700px)"
              srcSet="/media/hero/white-space-v1.png"
            />
            <img
              src="/media/hero/white-space-v1.png"
              alt="A luminous white cosmic void with silver nebula clouds and distant stars."
            />
          </picture>
          <small>
            Still perspective. Interactive motion is unavailable in this
            browser.
          </small>
        </div>
      )}
    </div>
  );
}
