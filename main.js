import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const SHOW_CONTROLS = false;
const scene = new THREE.Scene();
scene.background = new THREE.Color("#f3eee6");

const camera = new THREE.PerspectiveCamera(
  42,
  window.innerWidth / window.innerHeight,
  0.1,
  100,
);
camera.position.set(0, 0.35, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.target.set(0, -0.25, 0);
controls.minDistance = 5;
controls.maxDistance = 16;

function updateResponsiveCamera() {
  const targetY =
    window.innerWidth <= 650 && window.innerHeight > window.innerWidth
      ? -0.9
      : -0.25;
  const offset = targetY - controls.target.y;
  controls.target.y = targetY;
  camera.position.y += offset;
  controls.update();
}

updateResponsiveCamera();

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let pointerStart;

scene.add(new THREE.HemisphereLight(0xfff8ed, 0x7f8b70, 2.1));

const keyLight = new THREE.DirectionalLight(0xfff3dd, 3.2);
keyLight.position.set(-4, 6, 7);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xdce9ff, 1.2);
fillLight.position.set(5, 2, 4);
scene.add(fillLight);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(12, 64),
  new THREE.MeshStandardMaterial({ color: "#e9e2d7", roughness: 1 }),
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -3.65;
scene.add(floor);

const defaults = {
  flowerType: "daisy",
  petals: 10,
  layers: 2,
  length: 1.35,
  width: 0.82,
  bloom: 1,
  stemLength: 3.4,
  petalColor: "#e98298",
  centerColor: "#d99b37",
  leafColor: "#4b8053",
};

const controlsPanel = document.querySelector("#controls");
const palettes = [
  { petalColor: "#e98298", centerColor: "#d99b37", leafColor: "#4b8053" },
  { petalColor: "#edaa62", centerColor: "#8d552f", leafColor: "#55764a" },
  { petalColor: "#a98ac7", centerColor: "#e2b64f", leafColor: "#547d68" },
  { petalColor: "#e9c85d", centerColor: "#a45b35", leafColor: "#56804d" },
  { petalColor: "#ed8d68", centerColor: "#d6b44c", leafColor: "#497b59" },
  { petalColor: "#d979a1", centerColor: "#e4bd53", leafColor: "#65834d" },
  { petalColor: "#f0d7c6", centerColor: "#bd7a3d", leafColor: "#4d7952" },
  { petalColor: "#d94f70", centerColor: "#f2c14e", leafColor: "#3d7048" },
  { petalColor: "#f4a7c1", centerColor: "#9b6a3c", leafColor: "#527a50" },
  { petalColor: "#7c9ed9", centerColor: "#f0c75e", leafColor: "#527b68" },
  { petalColor: "#f1e7d0", centerColor: "#c87845", leafColor: "#527d50" },
  { petalColor: "#bf5b45", centerColor: "#f3d16b", leafColor: "#4c7447" },
  { petalColor: "#8f6bb3", centerColor: "#edc85c", leafColor: "#527b61" },
  { petalColor: "#f2bd45", centerColor: "#8e4c30", leafColor: "#47744b" },
  { petalColor: "#72b7a1", centerColor: "#e7b64c", leafColor: "#477554" },
  { petalColor: "#e6a3a8", centerColor: "#7e573e", leafColor: "#637f4e" },
  { petalColor: "#cf7fce", centerColor: "#f1cf6b", leafColor: "#4b775d" },
  { petalColor: "#a9c96f", centerColor: "#b46c3b", leafColor: "#47754a" },
  { petalColor: "#ff3cac", centerColor: "#ffe45e", leafColor: "#087f5b" },
  { petalColor: "#00c2d1", centerColor: "#ff7b00", leafColor: "#31572c" },
  { petalColor: "#7b2cff", centerColor: "#f9c80e", leafColor: "#2a9d8f" },
  { petalColor: "#ff5d8f", centerColor: "#6a00f4", leafColor: "#70a288" },
  { petalColor: "#c1f000", centerColor: "#ff4d00", leafColor: "#386641" },
  { petalColor: "#ff6d00", centerColor: "#00e5ff", leafColor: "#3a5a40" },
  { petalColor: "#e500a4", centerColor: "#a8ff00", leafColor: "#147d64" },
  { petalColor: "#00a6fb", centerColor: "#ffbe0b", leafColor: "#588157" },
  { petalColor: "#b5179e", centerColor: "#f72585", leafColor: "#43aa8b" },
  { petalColor: "#ff4f79", centerColor: "#caffbf", leafColor: "#386641" },
  { petalColor: "#9ef01a", centerColor: "#ff006e", leafColor: "#3c6e47" },
  { petalColor: "#00f5d4", centerColor: "#f15bb5", leafColor: "#386641" },
  { petalColor: "#ff7900", centerColor: "#9b5de5", leafColor: "#588157" },
  { petalColor: "#3a86ff", centerColor: "#ff006e", leafColor: "#2d6a4f" },
  { petalColor: "#e0aaff", centerColor: "#fca311", leafColor: "#386641" },
  { petalColor: "#ff4d6d", centerColor: "#00bbf9", leafColor: "#527a50" },
];
const settings = { ...defaults };
let flower;

function randomRangeValue(input) {
  const min = Number(input.min);
  const max = Number(input.max);
  const step = Number(input.step);
  const decimalPlaces = (input.step.split(".")[1] || "").length;
  const stepCount = Math.round((max - min) / step);
  const randomStep = Math.floor(Math.random() * (stepCount + 1));
  return Number((min + randomStep * step).toFixed(decimalPlaces));
}

function syncControls() {
  document.querySelector("#flower-type").value = settings.flowerType;
  for (const input of controlsPanel.querySelectorAll("input")) {
    input.value = settings[input.dataset.setting];
    const output = input.dataset.output;
    if (output) {
      document.querySelector(`#${output}`).textContent = Number(
        input.value,
      ).toFixed(decimalPlaces(input));
    }
  }
}

function decimalPlaces(input) {
  return (input.step.split(".")[1] || "").length;
}

function randomizeSettings() {
  const palette = palettes[Math.floor(Math.random() * palettes.length)];
  Object.assign(settings, palette);
  const flowerTypes = ["daisy", "rose", "tulip"];
  settings.flowerType =
    flowerTypes[Math.floor(Math.random() * flowerTypes.length)];
  for (const input of controlsPanel.querySelectorAll('input[type="range"]')) {
    settings[input.dataset.setting] = randomRangeValue(input);
  }
}

function generateNewFlower() {
  const previousSettings = { ...settings };
  randomizeSettings();
  if (Object.keys(settings).every((key) => settings[key] === previousSettings[key])) {
    settings.flowerType =
      ["daisy", "rose", "tulip"].find(
        (type) => type !== previousSettings.flowerType,
      ) || "daisy";
  }
  syncControls();
  rebuildFlower();
}

function makePetalGeometry() {
  const lengthSteps = 28;
  const widthSteps = 12;
  const positions = [];
  const indices = [];

  for (let row = 0; row <= lengthSteps; row++) {
    const u = row / lengthSteps;
    const widthProfile =
      Math.pow(Math.sin(Math.PI * u), 0.58) * (0.68 + 0.32 * u);

    for (let col = 0; col <= widthSteps; col++) {
      const across = (col / widthSteps) * 2 - 1;
      const x = across * 0.5 * widthProfile;
      const y = u;
      const z =
        0.11 * Math.sin(Math.PI * u) +
        0.15 * u * u +
        0.08 * across * across * Math.sin(Math.PI * u);
      positions.push(x, y, z);
    }
  }

  for (let row = 0; row < lengthSteps; row++) {
    for (let col = 0; col < widthSteps; col++) {
      const a = row * (widthSteps + 1) + col;
      const b = a + widthSteps + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function makeLeafGeometry() {
  const geometry = makePetalGeometry();
  geometry.scale(0.7, 1, 0.8);
  return geometry;
}

function createDaisyHead(head) {
  const petalGeometry = makePetalGeometry();
  const petalMaterial = new THREE.MeshStandardMaterial({
    color: settings.petalColor,
    roughness: 0.48,
    side: THREE.DoubleSide,
  });
  const petalCount = Number(settings.petals);
  const layerCount = Number(settings.layers);

  for (let layer = 0; layer < layerCount; layer++) {
    const layerScale = 1 - layer * 0.15;
    const offset = (layer % 2) * (Math.PI / petalCount);

    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2 + offset;
      const petal = new THREE.Mesh(petalGeometry, petalMaterial);
      petal.userData.bloomPetal = true;
      petal.userData.bloomDelay = layer * 0.08;
      petal.rotation.z = -angle;
      petal.rotation.x = -0.12 + layer * 0.08;
      petal.position.set(
        Math.sin(angle) * 0.12,
        Math.cos(angle) * 0.12,
        layer * 0.045,
      );
      petal.scale.set(
        settings.width * settings.bloom * layerScale,
        settings.length * settings.bloom * layerScale,
        1,
      );
      head.add(petal);
    }
  }

  const center = new THREE.Mesh(
    new THREE.SphereGeometry(0.39, 32, 24),
    new THREE.MeshStandardMaterial({
      color: settings.centerColor,
      roughness: 0.82,
    }),
  );
  center.userData.bloomCenter = true;
  center.scale.z = 0.52;
  center.position.z = 0.1;
  head.add(center);

  const seedGeometry = new THREE.SphereGeometry(0.018, 6, 5);
  const seedMaterial = new THREE.MeshStandardMaterial({
    color: "#805226",
    roughness: 0.9,
  });
  const seedCount = 72;
  for (let i = 0; i < seedCount; i++) {
    const radius = 0.32 * Math.sqrt((i + 0.5) / seedCount);
    const angle = i * 2.39996;
    const seed = new THREE.Mesh(seedGeometry, seedMaterial);
    seed.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      0.1 + 0.19 * Math.sqrt(1 - (radius / 0.39) ** 2),
    );
    head.add(seed);
  }
}

function createRoseHead(head) {
  const rows = 24;
  const columns = 12;
  const positions = [];
  const indices = [];

  for (let row = 0; row <= rows; row++) {
    const u = row / rows;
    const width =
      (0.12 + 0.88 * Math.sin((u * Math.PI) / 2) ** 0.7) *
      (0.78 + 0.22 * Math.sin((u * Math.PI) / 2) ** 0.7);
    for (let column = 0; column <= columns; column++) {
      const across = (column / columns) * 2 - 1;
      const edge = Math.abs(across);
      positions.push(
        across * width * 0.5,
        u - 0.09 * edge * edge * u ** 5,
        0.14 * (1 - across * across) * Math.sin(Math.PI * u) +
          0.04 * across * across * u * u,
      );
    }
  }

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const a = row * (columns + 1) + column;
      const b = a + columns + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  const petalGeometry = new THREE.BufferGeometry();
  petalGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  petalGeometry.setIndex(indices);
  petalGeometry.computeVertexNormals();

  const rings = [
    { scale: 0.34, tilt: 0.12 },
    { scale: 0.47, tilt: 0.34 },
    { scale: 0.61, tilt: 0.62 },
    { scale: 0.73, tilt: 0.9 },
  ].slice(0, Number(settings.layers) + 1);
  const budY = -0.2;

  for (let ring = 0; ring < rings.length; ring++) {
    const { scale, tilt } = rings[ring];
    const attachmentRadius = 0.025 + ring * 0.012;
    const count = Math.max(
      4,
      Math.round(Number(settings.petals) * (0.45 + ring * 0.12)),
    );
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(settings.petalColor).offsetHSL(
        0,
        0,
        (ring - (rings.length - 1) / 2) * 0.035,
      ),
      roughness: 0.52,
      side: THREE.DoubleSide,
    });

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + ring * 0.42;
      const outward = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
      const direction = outward
        .multiplyScalar(Math.sin(tilt))
        .add(new THREE.Vector3(0, Math.cos(tilt), 0))
        .normalize();
      const tangent = new THREE.Vector3(Math.cos(angle), 0, -Math.sin(angle));
      const normal = new THREE.Vector3().crossVectors(tangent, direction);
      const orientation = new THREE.Matrix4().makeBasis(
        tangent,
        direction,
        normal,
      );
      const petal = new THREE.Mesh(petalGeometry, material);
      petal.userData.bloomPetal = true;
      petal.userData.bloomDelay = ring * 0.12;
      petal.quaternion.setFromRotationMatrix(orientation);
      petal.position.set(
        Math.sin(angle) * attachmentRadius,
        budY,
        Math.cos(angle) * attachmentRadius,
      );
      petal.scale.set(
        settings.width * settings.bloom * scale,
        settings.length * settings.bloom * (0.8 + ring * 0.08),
        1,
      );
      head.add(petal);
    }
  }

  const bud = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 20, 16),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(settings.petalColor).offsetHSL(0, 0, -0.08),
      roughness: 0.54,
    }),
  );
  bud.userData.bloomCenter = true;
  bud.position.y = budY;
  bud.scale.set(0.45, 0.45, 0.45);
  head.add(bud);
}

function makeTulipPetalGeometry() {
  const rows = 28;
  const columns = 14;
  const positions = [];
  const indices = [];

  for (let row = 0; row <= rows; row++) {
    const u = row / rows;
    const width = Math.sin(Math.PI * u) ** 0.52 * (0.72 + 0.28 * u);
    for (let column = 0; column <= columns; column++) {
      const across = (column / columns) * 2 - 1;
      positions.push(
        across * width * 0.5,
        u,
        0.16 * Math.sin(Math.PI * u) +
          0.12 * across * across * Math.sin(Math.PI * u),
      );
    }
  }

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const a = row * (columns + 1) + column;
      const b = a + columns + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createTulipHead(head) {
  const petalGeometry = makeTulipPetalGeometry();
  const petalMaterial = new THREE.MeshStandardMaterial({
    color: settings.petalColor,
    roughness: 0.46,
    side: THREE.DoubleSide,
  });
  const count = 6;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const petal = new THREE.Mesh(petalGeometry, petalMaterial);
    petal.userData.bloomPetal = true;
    petal.userData.bloomDelay = 0.08;
    petal.rotation.y = angle;
    petal.rotation.x = -0.14 + (i % 2) * 0.08;
    petal.position.set(Math.sin(angle) * 0.18, -0.32, Math.cos(angle) * 0.18);
    petal.scale.set(
      settings.width * settings.bloom * 1.65,
      settings.length * settings.bloom * 1.45,
      1,
    );
    head.add(petal);
  }
}

function createFlower() {
  const group = new THREE.Group();
  const head = new THREE.Group();
  head.position.y = 0;
  group.add(head);

  if (settings.flowerType === "rose") {
    createRoseHead(head);
  } else if (settings.flowerType === "tulip") {
    createTulipHead(head);
  } else {
    createDaisyHead(head);
  }

  const stemLength = Number(settings.stemLength);
  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -stemLength, 0),
    new THREE.Vector3(0.12, -stemLength * 0.68, 0),
    new THREE.Vector3(-0.1, -stemLength * 0.34, 0),
    new THREE.Vector3(0, -0.25, 0),
  ]);
  const stem = new THREE.Mesh(
    new THREE.TubeGeometry(stemCurve, 32, 0.075, 10, false),
    new THREE.MeshStandardMaterial({
      color: settings.leafColor,
      roughness: 0.72,
    }),
  );
  stem.userData.growingStem = true;
  stem.userData.stemLength = stemLength;
  group.add(stem);

  const leafGeometry = makeLeafGeometry();
  const leafMaterial = new THREE.MeshStandardMaterial({
    color: settings.leafColor,
    roughness: 0.58,
    side: THREE.DoubleSide,
  });
  for (const [height, angle] of [
    [-stemLength * 0.38, -0.95],
    [-stemLength * 0.62, 1.05],
  ]) {
    const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
    leaf.position.set(0.02, height, 0.015);
    leaf.rotation.z = angle;
    leaf.rotation.x = -0.12;
    leaf.scale.set(0.56, 1.05, 1);
    leaf.userData.growingLeaf = true;
    leaf.userData.leafDelay = height > -stemLength * 0.5 ? 0.18 : 0.38;
    group.add(leaf);
  }

  if (settings.flowerType === "tulip") {
    const calyx = new THREE.Mesh(
      new THREE.ConeGeometry(0.22, 0.38, 6),
      leafMaterial,
    );
    calyx.position.y = -0.28;
    calyx.rotation.x = Math.PI;
    head.add(calyx);
  }

  const animation = {
    startTime: performance.now(),
    duration: 2000,
    stem: null,
    head,
    petals: [],
    leaves: [],
    fallingPetals: [],
    lastFrameTime: performance.now(),
    bud: null,
    stemLength,
  };
  group.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;

    if (object.userData.growingStem) {
      animation.stem = object;
    } else if (object.userData.growingLeaf) {
      animation.leaves.push({
        mesh: object,
        scale: object.scale.clone(),
        delay: object.userData.leafDelay,
      });
      object.scale.setScalar(0.001);
    } else if (object.userData.bloomPetal) {
      animation.petals.push({
        mesh: object,
        scale: object.scale.clone(),
        delay: object.userData.bloomDelay,
      });
      object.scale.setScalar(0.001);
    } else if (object.userData.bloomCenter) {
      animation.bud = { mesh: object, scale: object.scale.clone() };
      object.scale.setScalar(0.001);
    }
  });
  head.position.y = -stemLength;
  group.userData.bloomAnimation = animation;
  return group;
}

function updateBloomAnimation(time) {
  const animation = flower?.userData.bloomAnimation;
  if (!animation) return;

  const delta = Math.min((time - animation.lastFrameTime) / 1000, 0.05);
  animation.lastFrameTime = time;
  const progress = Math.min(
    1,
    (time - animation.startTime) / animation.duration,
  );
  const stemProgress = Math.min(1, progress / 0.5);
  const easedStem = stemProgress * stemProgress * (3 - 2 * stemProgress);

  animation.stem.scale.y = easedStem;
  animation.stem.position.y = -animation.stemLength * (1 - easedStem);
  animation.head.position.y = -animation.stemLength * (1 - easedStem);

  for (const leaf of animation.leaves) {
    const leafProgress = Math.max(
      0,
      Math.min(1, (stemProgress - leaf.delay) / 0.28),
    );
    const easedLeaf = leafProgress * leafProgress * (3 - 2 * leafProgress);
    leaf.mesh.scale.copy(leaf.scale).multiplyScalar(easedLeaf);
  }

  const openingProgress = Math.max(0, Math.min(1, (progress - 0.38) / 0.62));
  for (const petal of animation.petals) {
    if (petal.mesh.userData.isFalling) continue;
    const localProgress = Math.max(
      0,
      Math.min(1, (openingProgress - petal.delay) / (1 - petal.delay)),
    );
    const easedPetal = localProgress * localProgress * (3 - 2 * localProgress);
    petal.mesh.scale.copy(petal.scale).multiplyScalar(easedPetal);
  }

  for (const falling of animation.fallingPetals) {
    if (falling.landed) continue;
    falling.velocity -= 3.2 * delta;
    falling.mesh.position.y += falling.velocity * delta;
    falling.mesh.rotation.x += falling.rotationSpeed.x * delta;
    falling.mesh.rotation.z += falling.rotationSpeed.z * delta;
    if (falling.mesh.position.y <= -3.58) {
      falling.mesh.position.y = -3.58;
      falling.velocity = 0;
      falling.landed = true;
    }
  }

  if (
    animation.petals.length > 0 &&
    animation.petals.every(({ mesh }) => mesh.userData.isFalling) &&
    animation.fallingPetals.every(({ landed }) => landed)
  ) {
    generateNewFlower();
    return;
  }

  if (animation.bud) {
    const budProgress = Math.min(1, progress / 0.6);
    const easedBud = budProgress * budProgress * (3 - 2 * budProgress);
    animation.bud.mesh.scale.copy(animation.bud.scale).multiplyScalar(easedBud);
  }
}

function rebuildFlower() {
  if (flower) {
    scene.remove(flower);
    flower.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  }
  flower = createFlower();
  scene.add(flower);
}

renderer.domElement.addEventListener("pointerdown", (event) => {
  pointerStart = {
    pointerId: event.pointerId,
    x: event.clientX,
    y: event.clientY,
  };
});

window.addEventListener("pointerup", (event) => {
  if (!pointerStart || pointerStart.pointerId !== event.pointerId) return;
  const start = pointerStart;
  pointerStart = null;
  if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10) return;

  const bounds = renderer.domElement.getBoundingClientRect();
  pointer.set(
    ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
    -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
  );
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster
    .intersectObject(flower, true)
    .find(({ object }) => object.userData.bloomPetal && !object.userData.isFalling);
  if (!hit) return;

  const animation = flower.userData.bloomAnimation;
  flower.attach(hit.object);
  hit.object.userData.isFalling = true;
  animation.fallingPetals.push({
    mesh: hit.object,
    velocity: 0,
    rotationSpeed: {
      x: (Math.random() - 0.5) * 2.4,
      z: (Math.random() - 0.5) * 2.4,
    },
    landed: false,
  });
});

controlsPanel.hidden = !SHOW_CONTROLS;
for (const input of controlsPanel.querySelectorAll("input")) {
  input.addEventListener("input", () => {
    const { setting, output } = input.dataset;
    settings[setting] =
      input.type === "range" ? Number(input.value) : input.value;
    if (output) {
      document.querySelector(`#${output}`).textContent = Number(
        input.value,
      ).toFixed(decimalPlaces(input));
    }
    rebuildFlower();
  });
}
document.querySelector("#flower-type").addEventListener("change", (event) => {
  settings.flowerType = event.target.value;
  rebuildFlower();
});

document.querySelector("#reset").addEventListener("click", () => {
  Object.assign(settings, defaults);
  syncControls();
  rebuildFlower();
});

randomizeSettings();
syncControls();
rebuildFlower();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  updateResponsiveCamera();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

function animate() {
  requestAnimationFrame(animate);
  updateBloomAnimation(performance.now());
  controls.update();
  renderer.render(scene, camera);
}

animate();
