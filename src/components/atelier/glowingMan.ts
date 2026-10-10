import * as THREE from "three";

/**
 * The runner as a man made of light: white-hot through the middle, warming to amber at his
 * edges, wrapped in two soft sleeves of glow and a bloom behind them. None of it is shaded
 * by the scene, so he is always the brightest thing on the stairs; the light he throws onto
 * the stones is a separate point light that the caller moves with him.
 *
 * Built facing +z with his feet at the origin, about 0.55 units tall before scaling.
 */
export type ManPose = "running" | "standing" | "dropping" | "falling";

const lit = (strength: number, color: string) =>
  new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uStrength: { value: strength },
    },
    vertexShader: `varying vec3 vNormal;
      void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    // Brightest where the surface faces the camera, fading to nothing at the outline.
    fragmentShader: `uniform vec3 uColor; uniform float uStrength; varying vec3 vNormal;
      void main() { float facing = abs(normalize(vNormal).z); gl_FragColor = vec4(uColor, pow(facing, 1.7) * uStrength); }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

function haloTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const context = canvas.getContext("2d")!;
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,248,230,1)");
  gradient.addColorStop(0.16, "rgba(255,222,156,.78)");
  gradient.addColorStop(0.42, "rgba(255,170,82,.26)");
  gradient.addColorStop(0.72, "rgba(255,140,50,.07)");
  gradient.addColorStop(1, "rgba(255,130,40,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createGlowingMan() {
  const core = new THREE.ShaderMaterial({
    uniforms: {
      uCore: { value: new THREE.Color(1, 0.99, 0.955) },
      uRim: { value: new THREE.Color(1, 0.76, 0.42) },
    },
    vertexShader: `varying vec3 vNormal;
      void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform vec3 uCore, uRim; varying vec3 vNormal;
      void main() { float facing = abs(normalize(vNormal).z); gl_FragColor = vec4(mix(uRim, uCore, smoothstep(0.0, 0.28, facing)), 1.0); }`,
  });
  const inner = lit(0.38, "#ffd790");
  const outer = lit(0.13, "#ff9c48");
  const materials: THREE.Material[] = [core, inner, outer];

  const figure = new THREE.Group();
  /** A part of the body, with its two sleeves of glow around it. */
  const part = (
    parent: THREE.Object3D,
    geometry: THREE.BufferGeometry,
    at: [number, number, number],
    sleeve: [number, number, number] = [1.55, 1.08, 1.55]
  ) => {
    const body = new THREE.Mesh(geometry, core);
    body.position.set(...at);
    body.renderOrder = 20;
    parent.add(body);
    [
      [inner, 1],
      [outer, 1.75],
    ].forEach(([material, grow], layer) => {
      const glow = new THREE.Mesh(geometry, material as THREE.Material);
      const g = grow as number;
      glow.scale.set(
        1 + (sleeve[0] - 1) * g,
        1 + (sleeve[1] - 1) * g,
        1 + (sleeve[2] - 1) * g
      );
      glow.renderOrder = 21 + layer;
      body.add(glow);
    });
    return body;
  };
  const joint = (parent: THREE.Object3D, x: number, y: number, z = 0) => {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    parent.add(group);
    return group;
  };

  // Hips, then the torso leaning from them.
  const pelvis = joint(figure, 0, 0.275);
  part(pelvis, new THREE.SphereGeometry(0.038, 14, 10), [0, 0.005, 0], [1.6, 1.5, 1.6]).scale.set(1.3, 0.8, 0.85);
  const torso = joint(pelvis, 0, 0.01);
  // A narrow waist under broad, flat shoulders, and a neck between them and the head.
  part(torso, new THREE.CapsuleGeometry(0.034, 0.07, 6, 14), [0, 0.055, 0]).scale.set(1.05, 1, 0.85);
  part(torso, new THREE.CapsuleGeometry(0.05, 0.065, 6, 14), [0, 0.135, 0]).scale.set(1.38, 1, 0.72);
  part(torso, new THREE.CapsuleGeometry(0.015, 0.035, 4, 10), [0, 0.205, 0.004]);
  part(torso, new THREE.SphereGeometry(0.043, 18, 14), [0, 0.25, 0.006], [1.55, 1.45, 1.55]).scale.set(0.92, 1.16, 1);

  const arm = (side: number) => {
    const shoulder = joint(torso, side * 0.083, 0.17);
    part(shoulder, new THREE.CapsuleGeometry(0.017, 0.07, 4, 10), [0, -0.048, 0]);
    const elbow = joint(shoulder, 0, -0.098);
    part(elbow, new THREE.CapsuleGeometry(0.015, 0.064, 4, 10), [0, -0.043, 0]);
    part(elbow, new THREE.SphereGeometry(0.016, 10, 8), [0, -0.092, 0], [1.6, 1.6, 1.6]);
    return { shoulder, elbow };
  };
  const leg = (side: number) => {
    const hip = joint(pelvis, side * 0.036, -0.008);
    part(hip, new THREE.CapsuleGeometry(0.024, 0.095, 4, 10), [0, -0.064, 0]);
    const knee = joint(hip, 0, -0.132);
    part(knee, new THREE.CapsuleGeometry(0.019, 0.095, 4, 10), [0, -0.064, 0]);
    part(knee, new THREE.CapsuleGeometry(0.013, 0.03, 4, 8), [0, -0.13, 0.018]).rotation.x = Math.PI / 2;
    return { hip, knee };
  };
  const arms = [arm(1), arm(-1)];
  const legs = [leg(1), leg(-1)];

  // The bloom is a lens effect, so it lives outside the body and is placed by the caller.
  const texture = haloTexture();
  const sprite = (opacity: number) =>
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity,
      toneMapped: false,
    });
  // Faint enough that the white figure inside it still reads as a man.
  const haloMaterial = sprite(0.32),
    bloomMaterial = sprite(0.22);
  materials.push(haloMaterial, bloomMaterial);
  const halo = new THREE.Group();
  const close = new THREE.Sprite(haloMaterial);
  close.scale.set(0.46, 0.74, 1);
  close.renderOrder = 24;
  const wide = new THREE.Sprite(bloomMaterial);
  wide.scale.set(1.45, 1.6, 1);
  wide.renderOrder = 23;
  halo.add(wide, close);

  /** Every joint eases toward its target, so changes of pose never snap. */
  const targets = new Map<THREE.Object3D, THREE.Euler>();
  const aim = (object: THREE.Object3D, x: number, z = 0) => {
    let target = targets.get(object);
    if (!target) targets.set(object, (target = new THREE.Euler()));
    target.set(x, 0, z);
  };
  const pose = (kind: ManPose, phase: number, time: number, dt: number) => {
    const swing = phase * Math.PI * 2;
    if (kind === "running") {
      aim(torso, 0.17);
      legs.forEach((limb, i) => {
        const step = swing + i * Math.PI;
        aim(limb.hip, -0.62 * Math.sin(step));
        aim(limb.knee, 0.12 + 1.05 * Math.max(0, Math.cos(step)) ** 1.3);
      });
      arms.forEach((limb, i) => {
        const step = swing + i * Math.PI;
        aim(limb.shoulder, 0.58 * Math.sin(step), (i ? -1 : 1) * 0.1);
        aim(limb.elbow, -1.3 + 0.25 * Math.sin(step));
      });
    } else if (kind === "standing") {
      aim(torso, 0.03);
      legs.forEach((limb, i) => {
        aim(limb.hip, i ? 0.06 : -0.04, (i ? -1 : 1) * 0.06);
        aim(limb.knee, 0.08);
      });
      arms.forEach((limb, i) => {
        aim(limb.shoulder, 0.05, (i ? -1 : 1) * 0.2);
        aim(limb.elbow, -0.25);
      });
    } else {
      // In the air: arms up, legs loose. Falling, they flail.
      const flail = kind === "falling" ? 1 : 0.25;
      aim(torso, -0.08);
      legs.forEach((limb, i) => {
        const wave = Math.sin(time * 11 + i * 2.1) * 0.35 * flail;
        aim(limb.hip, (i ? 0.25 : -0.35) + wave);
        aim(limb.knee, 0.45 + wave * 0.6);
      });
      arms.forEach((limb, i) => {
        const wave = Math.sin(time * 13 + i * 1.7) * 0.4 * flail;
        aim(limb.shoulder, -2.55 + wave, (i ? -1 : 1) * 0.42);
        aim(limb.elbow, -0.35 - wave * 0.5);
      });
    }
    const ease = 1 - Math.exp(-dt * 26);
    targets.forEach((target, object) => {
      object.rotation.x += (target.x - object.rotation.x) * ease;
      object.rotation.z += (target.z - object.rotation.z) * ease;
    });
  };

  return {
    figure,
    halo,
    pose,
    /** At the optical join he belongs to the front stone, whatever his depth says. */
    setDepthTest(on: boolean) {
      materials.forEach((material) => (material.depthTest = on));
    },
    dispose() {
      texture.dispose();
    },
  };
}
