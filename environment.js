import * as THREE from "three";
import { TeapotGeometry } from "https://unpkg.com/three@0.160.0/examples/jsm/geometries/TeapotGeometry.js";

export function createEnvironment(scene) {
  const loader = new THREE.TextureLoader();
  const textures = createFloorTextures(loader);

  // Expanded Ground: 240x240
  const ground = new THREE.Mesh(
    new THREE.BoxGeometry(240, 2, 240),
    new THREE.MeshStandardMaterial({ map: textures.grid, roughness: 0.4, metalness: 0.1 })
  );
  ground.position.set(0, -1, 0);
  ground.receiveShadow = true;
  scene.add(ground);

  // Expanded Ceiling at y=50
  const ceiling = new THREE.Mesh(
    new THREE.BoxGeometry(240, 2, 240),
    new THREE.MeshStandardMaterial({ color: 0x1a212f, roughness: 0.8, metalness: 0.3 })
  );
  ceiling.position.set(0, 50, 0);
  ceiling.receiveShadow = true;
  scene.add(ceiling);

  // Enclosing walls (240 width, 52 height)
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x222b3c,
    roughness: 0.5,
    metalness: 0.6,
  });

  const wallNorth = new THREE.Mesh(new THREE.BoxGeometry(240, 52, 2), wallMaterial);
  wallNorth.position.set(0, 25, -120);
  wallNorth.receiveShadow = true;
  wallNorth.castShadow = true;
  scene.add(wallNorth);

  const wallSouth = new THREE.Mesh(new THREE.BoxGeometry(240, 52, 2), wallMaterial);
  wallSouth.position.set(0, 25, 120);
  wallSouth.receiveShadow = true;
  wallSouth.castShadow = true;
  scene.add(wallSouth);

  const wallWest = new THREE.Mesh(new THREE.BoxGeometry(2, 52, 240), wallMaterial);
  wallWest.position.set(-120, 25, 0);
  wallWest.receiveShadow = true;
  wallWest.castShadow = true;
  scene.add(wallWest);

  const wallEast = new THREE.Mesh(new THREE.BoxGeometry(2, 52, 240), wallMaterial);
  wallEast.position.set(120, 25, 0);
  wallEast.receiveShadow = true;
  wallEast.castShadow = true;
  scene.add(wallEast);

  // Decorative wall pillars (scaled up to height 50)
  const pillarGeometry = new THREE.BoxGeometry(3, 50, 3);
  const pillarMaterial = new THREE.MeshStandardMaterial({ color: 0x141a26, metalness: 0.8, roughness: 0.2 });
  
  for (let z = -105; z <= 105; z += 15) {
    const p1 = new THREE.Mesh(pillarGeometry, pillarMaterial);
    p1.position.set(-118.5, 25, z);
    p1.castShadow = true;
    p1.receiveShadow = true;
    scene.add(p1);

    const p2 = new THREE.Mesh(pillarGeometry, pillarMaterial);
    p2.position.set(118.5, 25, z);
    p2.castShadow = true;
    p2.receiveShadow = true;
    scene.add(p2);
  }

  for (let x = -105; x <= 105; x += 15) {
    const p1 = new THREE.Mesh(pillarGeometry, pillarMaterial);
    p1.position.set(x, 25, -118.5);
    p1.castShadow = true;
    p1.receiveShadow = true;
    scene.add(p1);

    const p2 = new THREE.Mesh(pillarGeometry, pillarMaterial);
    p2.position.set(x, 25, 118.5);
    p2.castShadow = true;
    p2.receiveShadow = true;
    scene.add(p2);
  }

  // Glowing neon trim stripes
  const stripeMaterial = new THREE.MeshStandardMaterial({
    color: 0x00f3ff,
    emissive: 0x00f3ff,
    emissiveIntensity: 2.0,
  });

  const stripeN = new THREE.Mesh(new THREE.BoxGeometry(240, 0.4, 0.4), stripeMaterial);
  stripeN.position.set(0, 45, -118.9);
  scene.add(stripeN);

  const stripeS = new THREE.Mesh(new THREE.BoxGeometry(240, 0.4, 0.4), stripeMaterial);
  stripeS.position.set(0, 45, 118.9);
  scene.add(stripeS);

  const stripeW = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 240), stripeMaterial);
  stripeW.position.set(-118.9, 45, 0);
  scene.add(stripeW);

  const stripeE = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 240), stripeMaterial);
  stripeE.position.set(118.9, 45, 0);
  scene.add(stripeE);

  // Volumetric Sci-fi Light Cones under ceiling lights
  const coneGeo = new THREE.CylinderGeometry(6, 18, 50, 16, 1, true);
  const coneMat = new THREE.MeshBasicMaterial({
    color: 0xd9f0ff,
    transparent: true,
    opacity: 0.05,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const panelCoords = [
    [60, 49.8, 60],
    [-60, 49.8, 60],
    [60, 49.8, -60],
    [-60, 49.8, -60],
    [0, 49.8, 90],
    [0, 49.8, -90],
    [90, 49.8, 0],
    [-90, 49.8, 0]
  ];
  panelCoords.forEach(([x, y, z]) => {
    const lightCone = new THREE.Mesh(coneGeo, coneMat);
    lightCone.position.set(x, 25, z);
    scene.add(lightCone);
  });

  const targets = [];
  const animated = [];

  // Expanded base positions for targets (20 targets spread out)
  const basePositions = [
    new THREE.Vector3(-60, 0, -40),
    new THREE.Vector3(65, 0, -35),
    new THREE.Vector3(-45, 0, 55),
    new THREE.Vector3(50, 0, 60),
    new THREE.Vector3(0, 0, -75),
    new THREE.Vector3(75, 0, 30),
    new THREE.Vector3(-80, 0, 20),
    new THREE.Vector3(-70, 0, 70),
    new THREE.Vector3(25, 0, -90),
    new THREE.Vector3(90, 0, -50),
    new THREE.Vector3(80, 0, 80),
    new THREE.Vector3(-15, 0, -85),
    new THREE.Vector3(-90, 0, -65),
    new THREE.Vector3(20, 0, 95),
    new THREE.Vector3(-30, 0, -30),
    new THREE.Vector3(35, 0, -20),
    new THREE.Vector3(-55, 0, 10),
    new THREE.Vector3(55, 0, 15),
    new THREE.Vector3(-10, 0, 40),
    new THREE.Vector3(15, 0, -45)
  ];

  basePositions.forEach((pos, index) => {
    const target = createTarget(index);
    target.group.position.copy(pos);
    scene.add(target.group);
    targets.push(target);
    animated.push(...target.animated);
  });

  // Giant metallic teapot centerpiece
  const teapot = new THREE.Mesh(
    new TeapotGeometry(7, 12, true, true, true, false, true),
    new THREE.MeshStandardMaterial({ color: 0x90a8e0, metalness: 0.6, roughness: 0.2 })
  );
  teapot.position.set(0, 4.4, 0);
  teapot.castShadow = true;
  teapot.receiveShadow = true;
  scene.add(teapot);

  // Lively Moving Object 1: Floating Security Drones
  for (let i = 0; i < 5; i++) {
    const drone = createDrone(i);
    scene.add(drone.group);
    animated.push(drone);
  }

  // Lively Moving Object 2: Particle Spark / Dust System
  const particleGeo = new THREE.BufferGeometry();
  const particleCount = 200;
  const positionsArr = new Float32Array(particleCount * 3);
  const velocities = [];
  
  for (let i = 0; i < particleCount; i++) {
    positionsArr[i * 3] = (Math.random() - 0.5) * 220;
    positionsArr[i * 3 + 1] = Math.random() * 45 + 1.5;
    positionsArr[i * 3 + 2] = (Math.random() - 0.5) * 220;

    velocities.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 1,
        (Math.random() - 0.5) * 2
      )
    );
  }
  
  particleGeo.setAttribute("position", new THREE.BufferAttribute(positionsArr, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x00ffcc,
    size: 0.6,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  animated.push({
    type: "particles",
    mesh: particles,
    positionsArr,
    velocities
  });

  return {
    ground,
    targets,
    animated,
    textures,
    setFloorTexture: (mode) => setFloorTexture(ground, textures, mode),
    update: (delta, elapsed) => updateEnvironment(animated, delta, elapsed),
  };
}

// Helper to create an atmospheric, animated Drone
function createDrone(index) {
  const group = new THREE.Group();
  
  // Drone Body (Glowing core)
  const bodyGeo = new THREE.SphereGeometry(1.0, 16, 16);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xff3b9f,
    emissive: 0xff3b9f,
    emissiveIntensity: 1.5,
    metalness: 0.5,
    roughness: 0.2
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  group.add(body);

  // Outer Rotating Ring
  const ringGeo = new THREE.TorusGeometry(1.6, 0.15, 8, 32);
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x5a769d, metalness: 0.9, roughness: 0.1 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  // Antenna
  const antGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2);
  const ant = new THREE.Mesh(antGeo, ringMat);
  ant.position.y = 1.2;
  group.add(ant);

  const beaconGeo = new THREE.SphereGeometry(0.12, 8, 8);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.position.y = 1.8;
  group.add(beacon);

  // Orbit parameters
  const angleOffset = (index * Math.PI * 2) / 5;
  const radius = 55 + index * 12;
  const speed = 0.35 + index * 0.05;
  const heightBase = 12 + index * 4;

  // Set initial position
  group.position.set(
    Math.cos(angleOffset) * radius,
    heightBase,
    Math.sin(angleOffset) * radius
  );

  return {
    type: "drone",
    group,
    ring,
    speed,
    radius,
    heightBase,
    angle: angleOffset,
    bobOffset: index * 1.5
  };
}

function createTarget(index) {
  const group = new THREE.Group();
  const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x507590, metalness: 0.5, roughness: 0.4 });
  const accentMaterial = new THREE.MeshStandardMaterial({ color: 0x90e0ff, metalness: 0.4, roughness: 0.2 });
  const coreMaterial = new THREE.MeshStandardMaterial({ color: 0x3dfcd1, emissive: 0x1cfcac, emissiveIntensity: 0.8 });

  // Stylized base pedestal
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 3.4, 4.5, 18), baseMaterial);
  base.position.y = 2.2;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  // Floating Armor panels
  const armor = new THREE.Mesh(new THREE.BoxGeometry(4.6, 2.4, 4.6), accentMaterial);
  armor.position.y = 4.8;
  armor.castShadow = true;
  armor.receiveShadow = true;
  group.add(armor);

  const cone = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.5, 16), baseMaterial);
  cone.position.y = 7.2;
  cone.castShadow = true;
  group.add(cone);

  // Core target sphere
  const core = new THREE.Mesh(new THREE.SphereGeometry(1.2, 24, 20), coreMaterial);
  core.position.y = 5.2;
  core.castShadow = true;
  group.add(core);

  // Horizontal Halo Ring
  const torus = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.35, 16, 64), accentMaterial);
  torus.position.y = 8.3;
  torus.rotation.x = Math.PI / 2;
  torus.castShadow = true;
  group.add(torus);

  const animated = [
    { type: "torus", mesh: torus },
    { type: "core", mesh: core, baseScale: core.scale.clone(), offset: index * 0.4 },
  ];

  return { group, animated, hit: false, removing: false };
}

function updateEnvironment(animated, delta, elapsed) {
  animated.forEach((item) => {
    if (item.type === "torus") {
      item.mesh.rotation.z += delta * 0.8;
    }
    if (item.type === "core") {
      const pulse = 1 + Math.sin(elapsed * 2.4 + item.offset) * 0.08;
      item.mesh.scale.set(
        item.baseScale.x * pulse,
        item.baseScale.y * pulse,
        item.baseScale.z * pulse
      );
      item.mesh.rotation.y += delta * 0.6;
    }
    if (item.type === "drone") {
      // Update orbit angle
      item.angle += item.speed * delta;
      const x = Math.cos(item.angle) * item.radius;
      const z = Math.sin(item.angle) * item.radius;
      // Bobbing up and down
      const y = item.heightBase + Math.sin(elapsed * 1.5 + item.bobOffset) * 2.5;
      
      item.group.position.set(x, y, z);
      // Spin ring
      item.ring.rotation.z += delta * 2.0;
    }
    if (item.type === "particles") {
      const posAttr = item.mesh.geometry.attributes.position;
      const count = posAttr.count;
      
      for (let i = 0; i < count; i++) {
        // Apply velocity
        item.positionsArr[i * 3] += item.velocities[i].x * delta;
        item.positionsArr[i * 3 + 1] += item.velocities[i].y * delta;
        item.positionsArr[i * 3 + 2] += item.velocities[i].z * delta;

        // Wrap around boundary bounds (x/z: +/- 110, y: 1 to 45)
        if (Math.abs(item.positionsArr[i * 3]) > 115) {
          item.positionsArr[i * 3] = -Math.sign(item.positionsArr[i * 3]) * 114;
        }
        if (item.positionsArr[i * 3 + 1] < 1.0 || item.positionsArr[i * 3 + 1] > 48.0) {
          item.velocities[i].y *= -1; // bounce vertically
        }
        if (Math.abs(item.positionsArr[i * 3 + 2]) > 115) {
          item.positionsArr[i * 3 + 2] = -Math.sign(item.positionsArr[i * 3 + 2]) * 114;
        }
      }
      posAttr.needsUpdate = true;
    }
  });
}

function createFloorTextures(loader) {
  const gridTexture = createGridTexture();
  const brick = loader.load("https://threejs.org/examples/textures/brick_diffuse.jpg");
  const metal = loader.load("https://threejs.org/examples/textures/metal.jpg");

  [gridTexture, brick, metal].forEach((texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(16, 16); // Double repeats for 240x240 floor
    texture.anisotropy = 8;
  });

  return { grid: gridTexture, brick, metal };
}

function createGridTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#162233"; // Lighter floor grid background for brighter theme
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = "#4ff4ff";
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.8;

  for (let i = 0; i <= size; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }

  ctx.globalAlpha = 0.45;
  ctx.strokeStyle = "#9efff3";
  for (let i = 0; i <= size; i += 16) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function setFloorTexture(ground, textures, mode) {
  const map = textures[mode] || textures.grid;
  ground.material.map = map;
  ground.material.needsUpdate = true;
}
