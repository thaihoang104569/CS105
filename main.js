import * as THREE from "three";
import { createCameras, setActiveCamera, getActiveCamera, updateThirdPersonCamera, updateActiveCameraFromUI, handleResize } from "./camera.js";
import { createLighting, flashMuzzleLight, fadeMuzzleLight } from "./lighting.js";
import { createEnvironment } from "./environment.js";
import { createPlayer, createGameplay } from "./gameplay.js";

const canvas = document.getElementById("scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1f2c3c);

const viewport = { aspect: window.innerWidth / window.innerHeight };
const cameraState = createCameras(viewport);

const lighting = createLighting(scene);

const environment = createEnvironment(scene);
const player = createPlayer(scene);

lighting.muzzleFlash.position.copy(player.gunTip.position);
player.gunTip.add(lighting.muzzleFlash);

const scoreValue = document.getElementById("scoreValue");
const crosshair = document.getElementById("crosshair");

function updateCrosshairVisibility() {
  if (cameraState.activeIndex === 0) {
    crosshair.style.display = "none";
  } else {
    crosshair.style.display = "block";
  }
}

const gameplay = createGameplay({
  scene,
  player,
  targets: environment.targets,
  onScore: (value) => {
    scoreValue.textContent = value.toString();
  },
  muzzleLight: lighting.muzzleFlash,
});

const ui = {
  textureSelect: document.getElementById("textureSelect"),
  textureFileInput: document.getElementById("textureFileInput"),
  camX: document.getElementById("camX"),
  camY: document.getElementById("camY"),
  camZ: document.getElementById("camZ"),
  camNear: document.getElementById("camNear"),
  camFar: document.getElementById("camFar"),
  ambientIntensity: document.getElementById("ambientIntensity"),
  directionalIntensity: document.getElementById("directionalIntensity"),
  pointIntensity: document.getElementById("pointIntensity"),
  restartButton: document.getElementById("restartButton"),
};

const cameraInput = {
  forward: false,
  back: false,
  left: false,
  right: false,
  yaw: 0,
  pitch: -0.35,
};

let isPaused = false;

function readCameraUI() {
  return {
    x: Number(ui.camX.value),
    y: Number(ui.camY.value),
    z: Number(ui.camZ.value),
    near: Number(ui.camNear.value),
    far: Number(ui.camFar.value),
  };
}

ui.textureSelect.addEventListener("change", (event) => {
  environment.setFloorTexture(event.target.value);
});

ui.textureFileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const objectUrl = URL.createObjectURL(file);
    const loader = new THREE.TextureLoader();
    loader.load(objectUrl, (texture) => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(16, 16);
      texture.anisotropy = 8;
      
      environment.ground.material.map = texture;
      environment.ground.material.needsUpdate = true;
    });
  }
});

[ui.camX, ui.camY, ui.camZ, ui.camNear, ui.camFar].forEach((input) => {
  input.addEventListener("input", () => {
    updateActiveCameraFromUI(cameraState, readCameraUI());
    if (cameraState.activeIndex === 0) {
      syncPanoramicCameraInput();
    }
  });
});

[ui.ambientIntensity, ui.directionalIntensity, ui.pointIntensity].forEach((input) => {
  input.addEventListener("input", () => {
    lighting.ambient.intensity = Number(ui.ambientIntensity.value);
    lighting.directional.intensity = Number(ui.directionalIntensity.value);
    lighting.fillPoint.intensity = Number(ui.pointIntensity.value);
  });
});

lighting.ambient.intensity = Number(ui.ambientIntensity.value);
lighting.directional.intensity = Number(ui.directionalIntensity.value);
lighting.fillPoint.intensity = Number(ui.pointIntensity.value);

ui.restartButton.addEventListener("click", () => {
  gameplay.reset();
});

window.addEventListener("keydown", (event) => {
  if (event.code === "KeyP") {
    isPaused = !isPaused;
    if (isPaused) {
      gameplay.setFiring(false);
    } else {
      clock.getDelta();
    }
  }
  if (event.code === "Digit1") {
    setActiveCamera(cameraState, 0);
    updateActiveCameraFromUI(cameraState, readCameraUI());
    syncPanoramicCameraInput();
    updateCrosshairVisibility();
  }
  if (event.code === "Digit2") {
    setActiveCamera(cameraState, 1);
    updateCrosshairVisibility();
  }
  if (cameraState.activeIndex === 0) {
    updateCameraKeys(event, true);
  } else {
    gameplay.onKeyDown(event);
  }
});

window.addEventListener("keyup", (event) => {
  if (cameraState.activeIndex === 0) {
    updateCameraKeys(event, false);
  } else {
    gameplay.onKeyUp(event);
  }
});

canvas.addEventListener("mousedown", () => {
  if (document.pointerLockElement !== canvas) {
    canvas.requestPointerLock();
  }
  if (isPaused) return;
  if (cameraState.activeIndex === 1) {
    const activeCamera = getActiveCamera(cameraState);
    gameplay.onShoot(activeCamera, false);
    gameplay.setFiring(true);
    flashMuzzleLight(lighting.muzzleFlash);
  }
});

window.addEventListener("mouseup", () => {
  gameplay.setFiring(false);
});

window.addEventListener("mousemove", (event) => {
  if (document.pointerLockElement !== canvas) return;
  if (cameraState.activeIndex === 0) {
    const deltaX = event.movementX || 0;
    const deltaY = event.movementY || 0;
    cameraInput.yaw -= deltaX * 0.002;
    cameraInput.pitch -= deltaY * 0.002;
    cameraInput.pitch = THREE.MathUtils.clamp(cameraInput.pitch, -1.15, 0.75);
  } else {
    gameplay.onMouseMove(event);
  }
});

window.addEventListener("wheel", (event) => {
  if (cameraState.activeIndex !== 0) return;
  const activeCamera = getActiveCamera(cameraState);
  activeCamera.fov = THREE.MathUtils.clamp(activeCamera.fov + event.deltaY * 0.02, 35, 85);
  activeCamera.updateProjectionMatrix();
}, { passive: true });

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  viewport.aspect = window.innerWidth / window.innerHeight;
  handleResize(cameraState, viewport);
});

const clock = new THREE.Clock();

function animate() {
  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  if (!isPaused) {
    environment.update(delta, elapsed);
  }
  const activeCamera = getActiveCamera(cameraState);
  const useCameraOrigin = false;
  if (!isPaused) {
    gameplay.update(delta, activeCamera, useCameraOrigin);
    fadeMuzzleLight(lighting.muzzleFlash, delta);
  }
  updateThirdPersonCamera(cameraState, player.group, gameplay.getPitch());
  updatePanoramicControls(delta, getActiveCamera(cameraState));

  renderer.render(scene, getActiveCamera(cameraState));
  requestAnimationFrame(animate);
}

updateActiveCameraFromUI(cameraState, readCameraUI());
syncPanoramicCameraInput();
updateCrosshairVisibility();
animate();

function updateCameraKeys(event, state) {
  if (event.code === "KeyW") cameraInput.forward = state;
  if (event.code === "KeyS") cameraInput.back = state;
  if (event.code === "KeyA") cameraInput.left = state;
  if (event.code === "KeyD") cameraInput.right = state;
}

function updatePanoramicControls(delta, camera) {
  if (cameraState.activeIndex !== 0) return;
  camera.up.set(0, 1, 0);
  camera.rotation.order = "YXZ";
  camera.rotation.y = cameraInput.yaw;
  camera.rotation.x = cameraInput.pitch;
  camera.rotation.z = 0;

  const speed = 18;
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();

  const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
  const move = new THREE.Vector3();
  if (cameraInput.forward) move.add(forward);
  if (cameraInput.back) move.sub(forward);
  if (cameraInput.left) move.sub(right);
  if (cameraInput.right) move.add(right);

  if (move.lengthSq() > 0) {
    move.normalize().multiplyScalar(speed * delta);
    camera.position.add(move);
  }
}

function syncPanoramicCameraInput() {
  const active = getActiveCamera(cameraState);
  active.up.set(0, 1, 0);
  active.rotation.order = "YXZ";
  active.rotation.z = 0;
  cameraInput.yaw = active.rotation.y;
  cameraInput.pitch = active.rotation.x;
  cameraInput.forward = false;
  cameraInput.back = false;
  cameraInput.left = false;
  cameraInput.right = false;
}
