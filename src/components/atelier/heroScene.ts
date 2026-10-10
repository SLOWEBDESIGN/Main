import model from "../../data/penrose-model.json";

/** Dimensions and sightline extracted from the owner's Penrose Stairs.stl. */
export const MODEL_SCALE = 0.24;
// One vertical factor for every height and for the sightline itself. Looking along
// the scaled sightline gives the original picture squeezed vertically, so the optical
// join stays exact while the camera sits lower: about 40 degrees instead of 49.
export const RISE_SCALE = 0.72;
export const GROUND = -3.2;
// Extend the short closing flight by one real column. This opens the sightline
// enough to read the far treads without flattening their projected rise.
const lastSource = model.modules[model.modules.length - 1];
const modules = [
  ...model.modules,
  {
    ...lastSource,
    index: model.modules.length,
    top: [lastSource.top[0] + 10, lastSource.top[1] + 2, lastSource.top[2]],
    min: [lastSource.min[0] + 10, lastSource.min[1], lastSource.min[2]],
    max: [lastSource.max[0] + 10, lastSource.max[1] + 2, lastSource.max[2]],
  },
];
export const CAMERA_DIRECTION = {
  x: modules[modules.length - 1].top[0] - modules[0].top[0],
  y: (modules[modules.length - 1].top[1] - modules[0].top[1]) * RISE_SCALE,
  z: 10,
};
const tops = modules.map((module) => ({
  x: (module.top[0] - 15) * MODEL_SCALE,
  y: (module.top[1] - model.floor) * MODEL_SCALE * RISE_SCALE + GROUND,
  z: (Math.round(module.top[2]) + 15) * MODEL_SCALE,
}));
export const ICE_MODULES = modules.map((module) => ({
  index: module.index,
  top: tops[module.index],
  width: (module.max[0] - module.min[0]) * MODEL_SCALE,
  depth: 10 * MODEL_SCALE,
  height: 4.8,
}));
// The last physical module overlaps the first along the intended sightline.
// It is the optical join, not an extra stationary beat in the runner's route.
export const STAIR_COUNT = ICE_MODULES.length - 1;
export const MODULE_COUNT = ICE_MODULES.length;
export const STAIR_TREAD = 10 * MODEL_SCALE;

// Stones slam down one at a time, quicker as the loop fills, with a held breath
// before the last one closes it. The first module and the join module are drawn in the
// same place, so only one of them ever falls: the join, as the closing stone. The first
// module never drops; it is simply there, hidden behind the join, once that has landed.
const FALL_ORDER = ICE_MODULES.map((_, index) => index).slice(1);
const STONE_STARTS: number[] = ICE_MODULES.map(() => 0);
let clock = 0.3;
FALL_ORDER.forEach((index, order) => {
  if (order > 0) clock += order === FALL_ORDER.length - 1 ? 0.34 : 0.17 - (order - 1) * 0.006;
  STONE_STARTS[index] = clock;
});
const STONE_FALL = 0.4;
const lastLanding = STONE_STARTS[STAIR_COUNT] + STONE_FALL;
export const INTRO = {
  firstStone: STONE_STARTS[1],
  stoneFall: STONE_FALL,
  closed: lastLanding,
  assembled: lastLanding + 0.2,
  runnerDrop: lastLanding + 0.5,
  landed: lastLanding + 1.25,
  running: lastLanding + 1.65,
} as const;
export type HeroPhase = "waiting" | "building" | "landing" | "revealing" | "ready";
export interface ScenePoint {
  x: number;
  y: number;
  z: number;
}

const norm = Math.hypot(CAMERA_DIRECTION.x, CAMERA_DIRECTION.y, CAMERA_DIRECTION.z);
const horizontal = Math.hypot(CAMERA_DIRECTION.x, CAMERA_DIRECTION.z);
/** Toward the camera, and the right and up axes of the picture plane. */
export const VIEW: ScenePoint = {
  x: CAMERA_DIRECTION.x / norm,
  y: CAMERA_DIRECTION.y / norm,
  z: CAMERA_DIRECTION.z / norm,
};
export const SCREEN_RIGHT: ScenePoint = {
  x: CAMERA_DIRECTION.z / horizontal,
  y: 0,
  z: -CAMERA_DIRECTION.x / horizontal,
};
export const SCREEN_UP: ScenePoint = {
  x: (-CAMERA_DIRECTION.y * CAMERA_DIRECTION.x) / (horizontal * norm),
  y: horizontal / norm,
  z: (-CAMERA_DIRECTION.y * CAMERA_DIRECTION.z) / (horizontal * norm),
};

export function stairPoint(index: number): ScenePoint {
  return { ...ICE_MODULES[index].top };
}
export function runnerPose(progress: number) {
  const index = Math.floor(progress) % STAIR_COUNT;
  const phase = progress % 1;
  const current = stairPoint(index),
    next = stairPoint(index + 1);
  const smooth = (t: number) => t * t * (3 - 2 * t);
  // Feet cross the riser at mid-stride, not on a diagonal through the stone.
  const lift = smooth(Math.max(0, Math.min(1, (phase - 0.22) / 0.26)));
  const point = {
    x: current.x + (next.x - current.x) * phase,
    y:
      current.y +
      (next.y - current.y) * lift +
      Math.sin(phase * Math.PI) * 0.07,
    z: current.z + (next.z - current.z) * phase,
  };
  const fold = index === 0 ? 1 - smooth(phase) : 0;
  const join = stairPoint(STAIR_COUNT),
    first = stairPoint(0);
  const segmentHeading = (i: number) => {
    const a = stairPoint((i + STAIR_COUNT) % STAIR_COUNT);
    const b = stairPoint(((i + STAIR_COUNT) % STAIR_COUNT) + 1);
    return Math.atan2(b.x - a.x, b.z - a.z);
  };
  const turn = (a: number, b: number, t: number) =>
    a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * smooth(t);
  const heading = segmentHeading(index);
  const landing =
    index === 0 && phase < 0.3 ? STAIR_COUNT : index + (phase >= 0.88 ? 1 : 0);
  const support = stairPoint(landing);
  const depthShift =
    (support.y - (point.y + (join.y - first.y) * fold)) / CAMERA_DIRECTION.y;
  const contact = {
    x: point.x + (join.x - first.x) * fold + CAMERA_DIRECTION.x * depthShift,
    y: support.y,
    z: point.z + (join.z - first.z) * fold + CAMERA_DIRECTION.z * depthShift,
  };
  return {
    index,
    phase,
    point,
    fold,
    landing,
    contact,
    visiblePoint: {
      x: point.x + (join.x - first.x) * fold,
      y: point.y + (join.y - first.y) * fold,
      z: point.z + (join.z - first.z) * fold,
    },
    heading:
      phase < 0.2
        ? turn(segmentHeading(index - 1), heading, (phase + 0.2) / 0.4)
        : phase > 0.8
        ? turn(heading, segmentHeading(index + 1), (phase - 0.8) / 0.4)
        : heading,
  };
}
export function projectPoint(point: ScenePoint) {
  return {
    x: point.x * SCREEN_RIGHT.x + point.z * SCREEN_RIGHT.z,
    y: point.x * SCREEN_UP.x + point.y * SCREEN_UP.y + point.z * SCREEN_UP.z,
  };
}

/**
 * The three edge vectors of a column as the camera draws them. The outline of the whole
 * column is the hexagon these sweep out, which is what the hover layout keeps apart.
 */
export const COLUMN_GENERATORS = [
  projectPoint({ x: ICE_MODULES[0].width, y: 0, z: 0 }),
  projectPoint({ x: 0, y: ICE_MODULES[0].height, z: 0 }),
  projectPoint({ x: 0, y: 0, z: ICE_MODULES[0].depth }),
];
/** Where the middle of a slot's column sits in the picture plane, at rest. */
export function slotCenter(slot: number) {
  const top = projectPoint(ICE_MODULES[slot].top);
  return { x: top.x, y: top.y - COLUMN_GENERATORS[1].y / 2 };
}

/**
 * The loop has one fewer visible step than physical modules: the join module and
 * the first module are drawn in the same place, so they share slot 0. Everything a
 * hover does is keyed by slot, which moves the pair as one block.
 */
export const slotOf = (index: number) => index % STAIR_COUNT;
export const SLOT_COUNT = STAIR_COUNT;
/** How far the stone under the pointer is thrown, in the picture plane. */
export const PUSH_REACH = 1.5;
/** Beyond this push the pair reads as one loose block, so only one is drawn. */
export const SEAM_SWAP = 0.04;

/** How far it rises as it slides out, as a share of the slide. */
export const PUSH_LIFT = 0.3;

/**
 * The way a stone slides out of the loop: level, at right angles to its own flight, so on
 * a straight flight it slides along its neighbours' faces like a drawer, and at a corner it
 * leaves diagonally, away from both neighbours. Stones moving like this can sit in front of
 * or behind one another, but can never pass through each other.
 */
export function slotFacing(slot: number) {
  const join = ICE_MODULES[STAIR_COUNT].top,
    first = ICE_MODULES[0].top;
  // The step before the first stone is the last real one, carried back along the sightline.
  const previous =
    slot === 0
      ? {
          x: ICE_MODULES[STAIR_COUNT - 1].top.x - (join.x - first.x),
          z: ICE_MODULES[STAIR_COUNT - 1].top.z - (join.z - first.z),
        }
      : ICE_MODULES[slot - 1].top;
  const next = ICE_MODULES[slot + 1].top;
  const run = { x: next.x - previous.x, z: next.z - previous.z };
  const length = Math.hypot(run.x, run.z);
  // The loop turns the same way at every corner, so one side is always outward.
  return { x: run.z / length, z: -run.x / length };
}

/**
 * Where a loose block goes, for a push from 0 to 1. Both halves of the join share a slot,
 * so they get the same offset and stay aligned.
 */
export function pushOffset(amount: number, facing: { x: number; z: number }): ScenePoint {
  const slide = amount * PUSH_REACH;
  return { x: facing.x * slide, y: slide * PUSH_LIFT, z: facing.z * slide };
}

/**
 * Which half of the join is drawn. At rest both are drawn and the join module's
 * outgoing wall is left open, which is what makes the loop read as closed. Once the
 * slot is pushed loose, only the first module is drawn: it is a complete block that
 * really sits behind the next tread, so nothing doubles up.
 */
export function seamDisplay(push: number) {
  const loose = push > SEAM_SWAP;
  return { first: true, join: !loose, joinWall: false };
}

export function introFrame(time: number, instant = false) {
  const t = instant ? INTRO.running : Math.max(0, time);
  const phase: HeroPhase =
    t < INTRO.firstStone
      ? "waiting"
      : t < INTRO.assembled
      ? "building"
      : t < INTRO.landed
      ? "landing"
      : t < INTRO.running
      ? "revealing"
      : "ready";
  return {
    phase,
    runnerVisible: t >= INTRO.runnerDrop,
    arrival: Math.max(
      0,
      Math.min(1, (t - INTRO.runnerDrop) / (INTRO.landed - INTRO.runnerDrop))
    ),
    interfaceVisible: t >= INTRO.firstStone,
    running: t >= INTRO.running,
  };
}

/**
 * A stone drops from above the frame under constant acceleration and stops dead at
 * its place. `impact` counts the seconds since it landed, for the shake and the dust.
 */
export function stoneEntrance(index: number, time: number, instant = false) {
  if (index === 0) {
    // It twins the join module, which does the falling. It never drops; it appears,
    // unseen behind the join, the moment the join has landed.
    const settled = STONE_STARTS[STAIR_COUNT] + STONE_FALL;
    const landed = instant || time >= settled;
    return { visible: landed, offset: 0, tilt: 0, landed, impact: instant ? Infinity : time - settled };
  }
  const start = STONE_STARTS[index];
  const progress = instant
    ? 1
    : Math.max(0, Math.min(1, (time - start) / STONE_FALL));
  return {
    visible: instant || time >= start,
    offset: (17 + (index % 4) * 1.5) * (1 - progress * progress),
    tilt: (1 - progress) * 0.5,
    landed: progress === 1,
    impact: instant ? Infinity : time - start - STONE_FALL,
  };
}
