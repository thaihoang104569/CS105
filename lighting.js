import * as THREE from "three";

export function createLighting(scene) {
  // Bright Ambient Light
  const ambient = new THREE.AmbientLight(0xffffff, 0.95);
  scene.add(ambient);

  // Visible subjects for Ambient Light (8 glowing ceiling panels spread across the expanded 240x240 arena)
  const panelGeo = new THREE.BoxGeometry(24, 0.2, 24);
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 1.5,
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
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(x, y, z);
    scene.add(panel);
  });

  // Strong Directional Light for crisp shadows
  const directional = new THREE.DirectionalLight(0xffffff, 1.4);
  directional.position.set(40, 45, 30);
  directional.castShadow = true;
  directional.shadow.mapSize.width = 4096; // Higher resolution shadows for realism
  directional.shadow.mapSize.height = 4096;
  directional.shadow.camera.near = 1;
  directional.shadow.camera.far = 160;
  directional.shadow.camera.left = -120;
  directional.shadow.camera.right = 120;
  directional.shadow.camera.top = 120;
  directional.shadow.camera.bottom = -120;
  directional.shadow.bias = -0.0004;
  scene.add(directional);

  // Visible subject for Directional Light (Spotlight projector)
  // Ceiling mount & pole
  const bracketGeo = new THREE.CylinderGeometry(0.15, 0.15, 5);
  const bracketMat = new THREE.MeshStandardMaterial({ color: 0x2c3546, metalness: 0.9, roughness: 0.1 });
  const bracket = new THREE.Mesh(bracketGeo, bracketMat);
  bracket.position.set(40, 47.5, 30);
  scene.add(bracket);

  // Projector Head Group
  const projGroup = new THREE.Group();
  projGroup.position.set(40, 45, 30);

  const casingGeo = new THREE.CylinderGeometry(1.6, 1.2, 3.2, 16);
  const casingMat = new THREE.MeshStandardMaterial({ color: 0x343e52, metalness: 0.8, roughness: 0.2 });
  const casing = new THREE.Mesh(casingGeo, casingMat);
  casing.rotation.x = Math.PI / 2; // Orient along Z-axis
  projGroup.add(casing);

  const lensGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.2, 16);
  const lensMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 4.0,
  });
  const lens = new THREE.Mesh(lensGeo, lensMat);
  lens.rotation.x = Math.PI / 2;
  lens.position.z = 1.6; // Position at the front face
  projGroup.add(lens);

  scene.add(projGroup);
  projGroup.lookAt(0, 0, 0);

  // Point Light (Fill)
  const fillPoint = new THREE.PointLight(0xd9f0ff, 2.4, 160, 1.5);
  fillPoint.position.set(0, 25, 0);
  scene.add(fillPoint);

  // Visible subject for Point Light (Hanging sci-fi light bulb fixture)
  // Hanging cable from ceiling (y=50) down to y=25
  const cableGeo = new THREE.CylinderGeometry(0.08, 0.08, 25);
  const cableMat = new THREE.MeshStandardMaterial({ color: 0x12151c, metalness: 0.6, roughness: 0.7 });
  const cable = new THREE.Mesh(cableGeo, cableMat);
  cable.position.set(0, 37.5, 0);
  scene.add(cable);

  // Lamp Cap
  const capGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.6, 12);
  const cap = new THREE.Mesh(capGeo, bracketMat);
  cap.position.set(0, 25.5, 0);
  scene.add(cap);

  // Glowing Bulb
  const bulbGeo = new THREE.SphereGeometry(0.7, 16, 12);
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xd9f0ff,
    emissive: 0xd9f0ff,
    emissiveIntensity: 3.0,
  });
  const bulb = new THREE.Mesh(bulbGeo, bulbMat);
  bulb.position.set(0, 25, 0);
  scene.add(bulb);

  // Muzzle Flash Point Light
  const muzzleFlash = new THREE.PointLight(0x55fff2, 0, 12, 2.1);
  muzzleFlash.castShadow = false;
  scene.add(muzzleFlash);

  return { ambient, directional, fillPoint, muzzleFlash };
}

export function flashMuzzleLight(light) {
  light.intensity = 3.8;
  light.distance = 18;
  light.decay = 2.4;
}

export function fadeMuzzleLight(light, delta) {
  if (light.intensity <= 0.05) {
    light.intensity = 0;
    return;
  }
  light.intensity = THREE.MathUtils.lerp(light.intensity, 0, delta * 8);
}
