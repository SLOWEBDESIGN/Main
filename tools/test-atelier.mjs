import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import ts from "typescript";
import { createRequire } from "node:module";

function load(relative, mocks = {}) {
  const filename = path.resolve(relative);
  const source = fs.readFileSync(filename, "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;
  const exports = {};
  vm.runInNewContext(
    code,
    {
      exports,
      require: (id) => {
        if (id in mocks) return mocks[id];
        throw new Error(`Unmocked import ${id}`);
      },
      console,
    },
    { filename }
  );
  return exports;
}
const { newRunner, advanceRunner, isAirborne, FALL_TIME, DROP_TIME } = load(
  "src/components/atelier/runner.ts"
);
const { createIceColumn } = load("src/components/atelier/iceGeometry.ts", {
  three: createRequire(import.meta.url)("three"),
});
const { landingPoint, createQuarryLedge, createFoundation } = load(
  "src/components/atelier/heroGround.ts",
  {
    three: createRequire(import.meta.url)("three"),
  }
);
const {
  stairPoint,
  projectPoint,
  pushOffset,
  slotFacing,
  seamDisplay,
  slotOf,
  stoneEntrance,
  introFrame,
  INTRO,
  STAIR_COUNT,
  MODULE_COUNT,
  ICE_MODULES,
  GROUND,
  RISE_SCALE,
  SEAM_SWAP,
  CAMERA_DIRECTION,
  runnerPose,
} = load("src/components/atelier/heroScene.ts", {
  "../../data/penrose-model.json": JSON.parse(
    fs.readFileSync("src/data/penrose-model.json", "utf8")
  ),
});
test("impossible join closes in projection but not in physical height", () => {
  const first = stairPoint(0),
    end = stairPoint(STAIR_COUNT);
  const a = projectPoint(first),
    b = projectPoint(end);
  assert.ok(Math.abs(a.x - b.x) < 1e-10);
  assert.ok(Math.abs(a.y - b.y) < 1e-10);
  assert.ok(end.y - first.y > 4);
  assert.ok(Math.abs(end.x - first.x) > 4.7);
  assert.ok(
    Math.hypot(end.x - first.x, end.y - first.y, end.z - first.z) > 6.5
  );
  assert.equal(MODULE_COUNT, 14);
  assert.equal(STAIR_COUNT, 13);
});
test("the camera sits lower than before but still looks down on the loop", () => {
  const { x, y, z } = CAMERA_DIRECTION;
  const elevation = (Math.atan2(y, Math.hypot(x, z)) * 180) / Math.PI;
  assert.ok(elevation > 35 && elevation < 45, `elevation ${elevation}`);
});
test("modules derive from the supplied STL and preserve its optical endpoints", () => {
  const source = JSON.parse(
    fs.readFileSync("src/data/penrose-model.json", "utf8")
  );
  assert.equal(
    source.sha256,
    "a841e58b0fc0bf864d8ec4714b81ed5843c5df0d3b41d1f0de08a948401d093f"
  );
  for (const module of ICE_MODULES) {
    const original =
      source.modules[Math.min(module.index, source.modules.length - 1)];
    const extra = module.index === source.modules.length ? 2 : 0;
    assert.ok(
      Math.abs(
        module.top.y -
          ((original.top[1] + extra - source.floor) * 0.24 * RISE_SCALE +
            GROUND)
      ) < 1e-10
    );
    assert.ok(module.width > 2.3 && module.depth > 2.3);
  }
});
test("every real tread rises by the source model's step height", () => {
  for (let i = 0; i < STAIR_COUNT; i++) {
    assert.ok(stairPoint(i).y > GROUND);
    assert.ok(
      Math.abs(stairPoint(i + 1).y - stairPoint(i).y - 0.48 * RISE_SCALE) <
        1e-10
    );
  }
});
test("real tall cuboids touch face to face without gaps", () => {
  for (let i = 0; i < STAIR_COUNT; i++) {
    const a = ICE_MODULES[i],
      b = ICE_MODULES[i + 1];
    const dx = Math.sign(b.top.x - a.top.x),
      dz = Math.sign(b.top.z - a.top.z);
    assert.ok(
      Math.abs(
        (dx ? Math.abs(b.top.x - a.top.x) : Math.abs(b.top.z - a.top.z)) - 2.4
      ) < 1e-10
    );
    assert.ok(
      Math.min(a.top.y, b.top.y) -
        Math.max(a.top.y - a.height, b.top.y - b.height) >
        4
    );
    assert.equal(Math.abs(dx) + Math.abs(dz), 1);
  }
});
test("actual renderer geometry has flat bottoms and vertical walls, not a curved ribbon", () => {
  for (const m of ICE_MODULES) {
    const geometry = createIceColumn(m.width, m.height, m.depth),
      p = geometry.getAttribute("position");
    assert.equal(geometry.type, "BoxGeometry");
    const y = new Set(
      Array.from({ length: p.count }, (_, i) => p.getY(i).toFixed(6))
    );
    assert.equal(y.size, 2);
    assert.ok(m.height >= m.width * 2);
    for (let i = 0; i < p.count; i++)
      assert.ok(Math.abs(Math.abs(p.getY(i)) - m.height / 2) < 0.000001);
    geometry.dispose();
  }
});
test("optical join aligns all four flat lower corners", () => {
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const corner = (i) => {
        const m = ICE_MODULES[i];
        return projectPoint({
          x: m.top.x + (sx * m.width) / 2,
          y: m.top.y - m.height,
          z: m.top.z + (sz * m.depth) / 2,
        });
      };
      const a = corner(0),
        b = corner(STAIR_COUNT);
      assert.ok(Math.hypot(a.x - b.x, a.y - b.y) < 1e-10);
    }
});
test("each foundation bearing surface meets the actual column bottom", () => {
  const three = createRequire(import.meta.url)("three");
  const texture = new three.Texture();
  const { receivers } = createFoundation(ICE_MODULES, texture);
  assert.equal(receivers.length, MODULE_COUNT);
  for (let i = 0; i < MODULE_COUNT; i++) {
    const origin = landingPoint(ICE_MODULES[i]);
    assert.equal(origin.y, ICE_MODULES[i].top.y - ICE_MODULES[i].height);
    assert.equal(receivers[i].ledge.position.y, origin.y);
    const ray = new three.Raycaster(
      new three.Vector3(origin.x, origin.y + 0.5, origin.z),
      new three.Vector3(0, -1, 0)
    );
    receivers[i].ledge.updateMatrixWorld(true);
    const hit = ray.intersectObject(receivers[i].ledge)[0];
    assert.ok(hit, `no bearing surface under column ${i}`);
    assert.ok(Math.abs(hit.point.y - origin.y) < 1e-6);
  }
});
test("quarry geometry has deep fractured walls, and is deterministic", () => {
  const a = createQuarryLedge(2.4, 2.4, 4),
    b = createQuarryLedge(2.4, 2.4, 4);
  assert.deepEqual(
    [...a.attributes.position.array],
    [...b.attributes.position.array]
  );
  a.computeBoundingBox();
  assert.equal(a.boundingBox.max.y, 0);
  assert.ok(a.boundingBox.min.y < -5.4);
  assert.ok(a.boundingBox.max.x > 1.8);
  assert.ok([...a.attributes.normal.array].every(Number.isFinite));
});
test("the two foundation endpoints share the same optical silhouette", () => {
  const first = ICE_MODULES[0],
    last = ICE_MODULES[STAIR_COUNT];
  const a = createQuarryLedge(first.width, first.depth, 0).attributes.position;
  const b = createQuarryLedge(last.width, last.depth, 0).attributes.position;
  const start = landingPoint(first),
    end = landingPoint(last);
  assert.equal(a.count, b.count);
  for (let i = 0; i < a.count; i++) {
    const pa = projectPoint({
      x: start.x + a.getX(i),
      y: start.y + a.getY(i),
      z: start.z + a.getZ(i),
    });
    const pb = projectPoint({
      x: end.x + b.getX(i),
      y: end.y + b.getY(i),
      z: end.z + b.getZ(i),
    });
    assert.ok(Math.hypot(pa.x - pb.x, pa.y - pb.y) < 1e-6);
  }
});
test("runner position and heading stay continuous across every tread and the loop join", () => {
  for (let i = 1; i <= STAIR_COUNT; i++) {
    const a = runnerPose(i - 0.00001),
      b = runnerPose(i + 0.00001);
    const pa = projectPoint(a.visiblePoint),
      pb = projectPoint(b.visiblePoint);
    assert.ok(
      Math.hypot(pa.x - pb.x, pa.y - pb.y) < 0.0001,
      `Screen snap at ${i}`
    );
    assert.ok(
      Math.abs(
        Math.atan2(
          Math.sin(a.heading - b.heading),
          Math.cos(a.heading - b.heading)
        )
      ) < 0.001,
      `Heading snap at ${i}`
    );
  }
  const a = runnerPose(STAIR_COUNT - 0.00001).visiblePoint,
    b = runnerPose(STAIR_COUNT).visiblePoint;
  assert.ok(Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) < 0.0001);
});
test("runner clears the next tread before its center crosses the riser", () => {
  for (let i = 0; i < STAIR_COUNT; i++) {
    const next = stairPoint(i + 1),
      pose = runnerPose(i + 0.5);
    assert.ok(pose.point.y >= next.y);
    const fold = runnerPose(i).fold;
    assert.equal(fold, i === 0 ? 1 : 0);
  }
});
test("grounded separation preserves the visible foot position and anchors the visible join", () => {
  for (let i = 0; i < STAIR_COUNT; i++)
    for (const phase of [0.1, 0.95]) {
      const pose = runnerPose(i + phase);
      const a = projectPoint(pose.visiblePoint),
        b = projectPoint(pose.contact);
      assert.ok(Math.hypot(a.x - b.x, a.y - b.y) < 1e-10);
      assert.equal(pose.contact.y, stairPoint(pose.landing).y);
    }
  assert.equal(runnerPose(0.1).landing, STAIR_COUNT);
});
test("the far-flight centerline is no longer flattened by the old sightline", () => {
  const a = projectPoint(stairPoint(0)),
    b = projectPoint(stairPoint(4));
  assert.ok(Math.abs(a.y - b.y) > 0.45);
});
test("the join and the first module share one slot, so a hover moves them as one", () => {
  assert.equal(slotOf(0), slotOf(STAIR_COUNT));
  for (let i = 1; i < STAIR_COUNT; i++) assert.notEqual(slotOf(i), slotOf(0));
  for (const amount of [0, 0.05, 0.4, 1, 1.25]) {
    const offset = pushOffset(amount, slotFacing(slotOf(STAIR_COUNT)));
    const move = (p) => ({ x: p.x + offset.x, y: p.y + offset.y, z: p.z + offset.z });
    const a = projectPoint(move(stairPoint(0))),
      b = projectPoint(move(stairPoint(STAIR_COUNT)));
    assert.ok(Math.hypot(a.x - b.x, a.y - b.y) < 1e-10);
  }
});
test("every stone slides out of the loop, and visibly so", () => {
  const middle = { x: 0, z: 0 };
  for (let i = 0; i < STAIR_COUNT; i++) {
    middle.x += stairPoint(i).x / STAIR_COUNT;
    middle.z += stairPoint(i).z / STAIR_COUNT;
  }
  for (let i = 0; i < STAIR_COUNT; i++) {
    const facing = slotFacing(i),
      top = stairPoint(i);
    assert.ok(Math.abs(Math.hypot(facing.x, facing.z) - 1) < 1e-12);
    assert.ok((top.x - middle.x) * facing.x + (top.z - middle.z) * facing.z > 0, `stone ${i} faces in`);
    // The near corner slides mostly toward the camera, so it moves least on screen.
    const seen = projectPoint(pushOffset(1, facing));
    assert.ok(Math.hypot(seen.x, seen.y) > 0.7, `stone ${i} barely moves on screen`);
  }
});
test("neighbouring stones can slide past each other but never into each other", () => {
  // Each step's riser is the face two neighbours share. However far each one slides,
  // the gap across that face never closes.
  for (let i = 0; i < STAIR_COUNT; i++) {
    const j = (i + 1) % STAIR_COUNT;
    const from = i === STAIR_COUNT - 1 ? stairPoint(STAIR_COUNT - 1) : stairPoint(i);
    const to = i === STAIR_COUNT - 1 ? stairPoint(STAIR_COUNT) : stairPoint(j);
    const step = { x: to.x - from.x, z: to.z - from.z };
    const length = Math.hypot(step.x, step.z);
    for (const a of [0, 0.3, 0.7, 1, 1.25])
      for (const b of [0, 0.3, 0.7, 1, 1.25]) {
        const p = pushOffset(a, slotFacing(i)),
          q = pushOffset(b, slotFacing(j));
        const closing = ((q.x - p.x) * step.x + (q.z - p.z) * step.z) / length;
        assert.ok(closing >= -1e-9, `${i} and ${j} close by ${closing}`);
      }
  }
});
test("at rest the join keeps its outgoing wall open; once loose only one module is drawn", () => {
  for (const rest of [seamDisplay(0), seamDisplay(SEAM_SWAP / 2)]) {
    assert.equal(rest.first, true);
    assert.equal(rest.join, true);
    assert.equal(rest.joinWall, false);
  }
  const loose = seamDisplay(SEAM_SWAP + 0.01);
  assert.equal(loose.first, true);
  assert.equal(loose.join, false);
});
test("stones slam down one at a time under constant acceleration", () => {
  let previous = -Infinity;
  // The first module never falls (the join module does it for the pair), so the order
  // of falling is modules 1 to 13.
  for (let i = 1; i < MODULE_COUNT; i++) {
    let start = 0;
    while (!stoneEntrance(i, start).visible) start += 0.005;
    assert.ok(start - previous > 0.09, `stone ${i} starts too close to the last`);
    previous = start;
    const at = (t) => stoneEntrance(i, start + t * INTRO.stoneFall).offset;
    // Faster at the end than at the start, and exactly in place at the end.
    assert.equal(at(1), 0);
    assert.ok(at(0.9) - at(1) > 2 * (at(0) - at(0.1)));
    assert.equal(stoneEntrance(i, start + INTRO.stoneFall).landed, true);
  }
});
test("the first module and the join module fall as one stone, not twice", () => {
  // They are drawn in the same place, so two falls there would read as one block falling twice.
  const closing = MODULE_COUNT - 1;
  let falls = 0,
    lastOffset = 0;
  for (let t = 0; t < INTRO.closed + 1; t += 0.01) {
    const first = stoneEntrance(0, t),
      join = stoneEntrance(closing, t);
    assert.equal(first.offset, 0, "the first module never drops");
    assert.equal(first.tilt, 0);
    if (join.offset > 0 && lastOffset === 0) falls++;
    lastOffset = join.offset;
    // Hidden until the join has landed, then simply there.
    assert.equal(first.visible, join.landed);
  }
  assert.equal(falls, 1);
  assert.equal(stoneEntrance(0, INTRO.closed - 0.05).visible, false);
  assert.equal(stoneEntrance(0, INTRO.closed + 0.01).visible, true);
  // The join is the last stone to land, so it closes the loop.
  for (let i = 1; i < closing; i++)
    assert.ok(stoneEntrance(i, INTRO.closed - 0.3).landed);
  assert.equal(stoneEntrance(closing, INTRO.closed - 0.05).landed, false);
});
test("empty opening has no stones, runner, or interface", () => {
  for (let i = 0; i < STAIR_COUNT; i++)
    assert.equal(stoneEntrance(i, 0).visible, false);
  assert.equal(introFrame(0).runnerVisible, false);
  assert.equal(introFrame(0).interfaceVisible, false);
});
test("the interface appears with the first falling stone, before the loop closes", () => {
  assert.equal(introFrame(INTRO.firstStone - 0.001).phase, "waiting");
  assert.equal(introFrame(INTRO.firstStone - 0.001).interfaceVisible, false);
  assert.equal(introFrame(INTRO.firstStone).phase, "building");
  assert.equal(introFrame(INTRO.firstStone).interfaceVisible, true);
  assert.equal(stoneEntrance(1, INTRO.firstStone).landed, false);
  for (let i = 0; i < MODULE_COUNT; i++)
    assert.equal(stoneEntrance(i, INTRO.assembled).landed, true);
  assert.equal(introFrame(INTRO.assembled).runnerVisible, false);
  assert.equal(introFrame(INTRO.runnerDrop).interfaceVisible, true);
  assert.equal(introFrame(INTRO.landed).arrival, 1);
  assert.equal(introFrame(INTRO.landed).interfaceVisible, true);
  assert.equal(introFrame(INTRO.landed).running, false);
  assert.equal(introFrame(INTRO.running).running, true);
});
test("reduced motion skips all entrance displacement without hiding content", () => {
  const frame = introFrame(0, true);
  assert.equal(frame.phase, "ready");
  assert.equal(frame.interfaceVisible, true);
  for (let i = 0; i < STAIR_COUNT; i++) {
    const stone = stoneEntrance(i, 0, true);
    assert.equal(stone.offset, 0);
    assert.equal(stone.landed, true);
  }
});
test("runner arrives once, then starts the loop", () => {
  let state = newRunner();
  for (let i = 0; i < 50; i++) state = advanceRunner(state, 0.04, false, false);
  assert.equal(state.mode, "running");
  assert.equal(state.arrival, 1);
  assert.ok(state.progress > 0);
});
test("a stone knocked loose under a grounded runner drops him", () => {
  const state = advanceRunner(
    { mode: "running", progress: 5.12, fall: 0, arrival: 1 },
    0.016,
    true,
    false
  );
  assert.equal(state.mode, "falling");
  assert.equal(state.progress, 5.12);
});
test("a fall ends with a drop from above onto a steady tread, then running again", () => {
  let state = advanceRunner(
    { mode: "running", progress: 2.6, fall: 0, arrival: 1 },
    0.016,
    true,
    false
  );
  assert.equal(state.mode, "falling");
  let t = 0;
  while (state.mode === "falling") {
    state = advanceRunner(state, 0.04, false, false, 7);
    t += 0.04;
  }
  assert.ok(t > FALL_TIME - 0.05);
  assert.equal(state.mode, "arriving");
  assert.equal(state.progress, 7);
  assert.equal(state.arrival, 0);
  for (let i = 0; i < Math.ceil(DROP_TIME / 0.04) + 1; i++)
    state = advanceRunner(state, 0.04, false, false);
  assert.equal(state.mode, "running");
});
test("a stone pulled away near the end of a drop is missed, not landed on", () => {
  const early = advanceRunner(
    { mode: "arriving", progress: 7, fall: 0, arrival: 0.2 },
    0.016,
    true,
    false
  );
  assert.equal(early.mode, "arriving");
  const late = advanceRunner(
    { mode: "arriving", progress: 7, fall: 0, arrival: 0.7 },
    0.016,
    true,
    false
  );
  assert.equal(late.mode, "falling");
});
test("pause freezes every state including an in-progress fall", () => {
  for (const mode of ["arriving", "running", "falling"]) {
    const state = { mode, progress: 1.5, fall: 0.2, arrival: 0.3 };
    assert.equal(advanceRunner(state, 5, true, true), state);
  }
});
test("jump window has grounded time on both sides", () => {
  assert.equal(isAirborne(4.15), false);
  assert.equal(isAirborne(4.6), true);
  assert.equal(isAirborne(4.95), false);
});

let inserts = [],
  notifications = [],
  rateLimited = false,
  insertError = false;
const handler = load("src/pages/api/contact.ts", {
  "@/src/lib/server/email": {
    sendContactNotification: async (data) => notifications.push(data),
  },
  "@/src/lib/server/rateLimit": {
    clientIp: () => "127.0.0.1",
    tooManyRecent: async () => rateLimited,
  },
  "@/src/lib/server/supabaseAdmin": {
    supabaseAdmin: () => ({
      from: () => ({
        insert: async (row) => {
          inserts.push(row);
          return {
            error: insertError ? { message: "synthetic failure" } : null,
          };
        },
      }),
    }),
  },
  "@/src/lib/server/validate": load("src/lib/server/validate.ts"),
}).default;
const payload = {
  name: "Synthetic test",
  business: "Test fixture",
  email: "test@example.com",
  phone: "5550100000",
  businessType: "Other",
  budget: "Not sure yet",
  services:
    "Website, App or browser extension, Platform / business system, AI workflow / private tool, Content / reels, SEO / ongoing help",
  description: "A synthetic contract test. Never sent to a real service.",
  contactMethod: "Email",
};
async function request(body, method = "POST") {
  let code = 0,
    data;
  const res = {
    setHeader() {},
    status(value) {
      code = value;
      return this;
    },
    json(value) {
      data = value;
    },
  };
  await handler({ method, body, headers: {} }, res);
  return { code, data };
}
test("all six selected services are accepted and preserved", async () => {
  assert.ok(payload.services.length > 100);
  assert.equal((await request(payload)).code, 200);
  assert.equal(inserts.at(-1).services, payload.services);
  assert.equal(notifications.length, 1);
});
test("honeypot never writes or sends", async () => {
  const count = inserts.length;
  assert.equal((await request({ botField: "bot" })).code, 200);
  assert.equal(inserts.length, count);
});
test("invalid method and fields are rejected before storage", async () => {
  const count = inserts.length;
  assert.equal((await request(payload, "GET")).code, 405);
  assert.equal((await request({})).code, 400);
  assert.equal(
    (await request({ ...payload, email: "not-an-email" })).code,
    400
  );
  assert.equal(
    (await request({ ...payload, services: "x".repeat(501) })).code,
    400
  );
  assert.equal(inserts.length, count);
});
test("rate limiting still prevents writes", async () => {
  rateLimited = true;
  const count = inserts.length;
  assert.equal((await request(payload)).code, 429);
  assert.equal(inserts.length, count);
  rateLimited = false;
});
