import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

const loadingStatusEl = document.getElementById("loadingStatus");

function showStatus(msg) {
  if (!loadingStatusEl) return;
  loadingStatusEl.textContent = msg;
  loadingStatusEl.style.display = msg ? "block" : "none";
}

export function createPlayer(scene) {
  const group = new THREE.Group();

  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x4c87a6, metalness: 0.2, roughness: 0.6 });
  const headMaterial = new THREE.MeshStandardMaterial({ color: 0xa0d6ff, metalness: 0.2, roughness: 0.5 });
  const gunMaterial = new THREE.MeshStandardMaterial({ color: 0x2f3542, metalness: 0.6, roughness: 0.2 });

  // Fallback primitive shapes — visible while model loads
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.5, 3.2, 16), bodyMaterial);
  torso.position.y = 2.2;
  torso.castShadow = true;
  group.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), headMaterial);
  head.position.y = 4.2;
  head.castShadow = true;
  group.add(head);

  const gun = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 4, 12), gunMaterial);
  gun.rotation.z = Math.PI / 2;
  gun.position.set(1.8, 2.6, 1.2);
  gun.castShadow = true;
  group.add(gun);

  const gunTip = new THREE.Object3D();
  gunTip.position.set(3.8, 2.6, 1.2);
  group.add(gunTip);

  const player = {
    group,
    gunTip,
    idleModel: null,
    runForwardModel: null,
    runLeftModel: null,
    runRightModel: null,
    runBackwardModel: null,
    idleMixer: null,
    runForwardMixer: null,
    runLeftMixer: null,
    runRightMixer: null,
    runBackwardMixer: null
  };

  const textureLoader = new THREE.TextureLoader();

  // Load the extracted high-definition textures once to save memory and avoid multiple downloads
  const textures = {
    diffuse1001: textureLoader.load("assets/textures/Ch15_1001_Diffuse.png"),
    normal1001: textureLoader.load("assets/textures/Ch15_1001_Normal.png"),
    specular1001: textureLoader.load("assets/textures/Ch15_1001_Specular.png"),
    glossiness1001: textureLoader.load("assets/textures/Ch15_1001_Glossiness.png"),

    diffuse1002: textureLoader.load("assets/textures/Ch15_1002_Diffuse.png"),
    normal1002: textureLoader.load("assets/textures/Ch15_1002_Normal.png"),
    specular1002: textureLoader.load("assets/textures/Ch15_1002_Specular.png"),
    glossiness1002: textureLoader.load("assets/textures/Ch15_1002_Glossiness.png"),
    emissive1002: textureLoader.load("assets/textures/Ch15_1002_Emissive.png")
  };

  // Configure color space for proper Gamma correction in Three.js 0.160.0
  textures.diffuse1001.colorSpace = THREE.SRGBColorSpace;
  textures.diffuse1002.colorSpace = THREE.SRGBColorSpace;

  // Helper function to setup each loaded FBX model to reduce boilerplate
  function setupModel(fbx, name, isInitiallyVisible = false) {
    fbx.scale.setScalar(0.028);
    fbx.position.set(0, 0, 0);
    fbx.rotation.y = Math.PI; // Face camera forward direction
    fbx.visible = isInitiallyVisible;

    fbx.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m) => {
            const matName = (m.name || "").toLowerCase();

            // Ensure base color is pure white so that diffuse textures are rendered at full brightness
            if (m.color) m.color.setHex(0xffffff);

            // Map original high-definition textures to the respective body/head materials
            if (matName.includes("body1") || matName.includes("1002")) {
              // Set 1002 (Head, helmet, glowing visor, neck plating)
              m.map = textures.diffuse1002;
              m.normalMap = textures.normal1002;
              m.normalScale = new THREE.Vector2(1.2, 1.2);
              m.specularMap = textures.specular1002;
              m.emissiveMap = textures.emissive1002;
              m.emissive = new THREE.Color(0xffffff); // Use embedded emissive colors
              m.emissiveIntensity = 2.5; // Brighter glowing visor/lights
              m.metalness = 0.2; // Lower metalness to make it brighter
              m.roughness = 0.4;
            } else {
              // Set 1001 (Body suit, combat armor plating, gloves, boots, equipment)
              m.map = textures.diffuse1001;
              m.normalMap = textures.normal1001;
              m.normalScale = new THREE.Vector2(1.0, 1.0);
              m.specularMap = textures.specular1001;
              
              // Enable a soft, subtle self-illumination on the body suit so it pops beautifully in the dark
              m.emissiveMap = textures.diffuse1001;
              m.emissive = new THREE.Color(0xffffff);
              m.emissiveIntensity = 0.2; // Subtle 20% glow to keep the suit perfectly readable and bright
              
              m.metalness = 0.15; // Lower metalness makes the diffuse texture much brighter in dynamic shadows
              m.roughness = 0.55;
            }
            m.needsUpdate = true;
          });
        }
      }
    });

    group.add(fbx);

    let mixer = null;
    if (fbx.animations && fbx.animations.length > 0) {
      mixer = new THREE.AnimationMixer(fbx);
      const action = mixer.clipAction(fbx.animations[0]);
      action.play();
    }
    return { model: fbx, mixer };
  }

  // ---- Load 3D FBX Character Models ----
  const manager = new THREE.LoadingManager();

  manager.onStart = () => {
    showStatus("⏳ Loading character models...");
  };
  manager.onProgress = (url, loaded, total) => {
    const pct = Math.round((loaded / total) * 100);
    showStatus(`⏳ Loading character models... ${pct}%`);
  };
  manager.onLoad = () => {
    showStatus("");
  };
  manager.onError = (url) => {
    showStatus(`⚠ Failed to load: ${url}`);
    setTimeout(() => showStatus(""), 5000);
  };

  const fbxLoader = new FBXLoader(manager);

  // 1. Load Idle Model
  fbxLoader.load(
    "assets/models/Rifle_Idle.fbx",
    (fbx) => {
      const { model, mixer } = setupModel(fbx, "idle", true);
      player.idleModel = model;
      player.idleMixer = mixer;

      // Hide fallback primitives now that at least one model is loaded
      torso.visible = false;
      head.visible = false;
      gun.visible = false;

      // Reposition gunTip to align with weapon in the right hand of the FBX rig.
      gunTip.position.set(0.6, 3.5, -3.0);
    }
  );

  // 2. Load Run Forward Model
  fbxLoader.load(
    "assets/models/Rifle_Run.fbx",
    (fbx) => {
      const { model, mixer } = setupModel(fbx, "run_forward", false);
      player.runForwardModel = model;
      player.runForwardMixer = mixer;
    }
  );

  // 3. Load Run Left Model
  fbxLoader.load(
    "assets/models/Run_Left.fbx",
    (fbx) => {
      const { model, mixer } = setupModel(fbx, "run_left", false);
      player.runLeftModel = model;
      player.runLeftMixer = mixer;
    }
  );

  // 4. Load Run Right Model
  fbxLoader.load(
    "assets/models/Run_Right.fbx",
    (fbx) => {
      const { model, mixer } = setupModel(fbx, "run_right", false);
      player.runRightModel = model;
      player.runRightMixer = mixer;
    }
  );

  // 5. Load Run Backward Model
  fbxLoader.load(
    "assets/models/Run_Backward.fbx",
    (fbx) => {
      const { model, mixer } = setupModel(fbx, "run_backward", false);
      player.runBackwardModel = model;
      player.runBackwardMixer = mixer;
    }
  );

  group.position.set(0, 0, 30);
  scene.add(group);

  return player;
}


export function createGameplay({ scene, player, targets, onScore, muzzleLight }) {
  const bullets = [];
  const input = { forward: false, back: false, left: false, right: false };
  const rotation = { yaw: 0, pitch: 0 };
  let eliminated = 0;
  let canShoot = true;
  let isFiring = false;
  let fireCooldown = 0;
  const initialPlayer = {
    position: player.group.position.clone(),
    rotationY: player.group.rotation.y,
  };

  function onKey(event, state) {
    if (event.code === "KeyW") input.forward = state;
    if (event.code === "KeyS") input.back = state;
    if (event.code === "KeyA") input.left = state;
    if (event.code === "KeyD") input.right = state;
  }

  function onMouseMove(event) {
    const deltaX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const deltaY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
    rotation.yaw -= deltaX * 0.002;
    rotation.pitch -= deltaY * 0.002;

    // Clamp pitch to prevent flipping
    rotation.pitch = THREE.MathUtils.clamp(rotation.pitch, -0.6, 0.6);

    player.group.rotation.y = rotation.yaw;
  }

  function isChildOf(object, parent) {
    let current = object;
    while (current) {
      if (current === parent) return true;
      current = current.parent;
    }
    return false;
  }

  function spawnBullet(camera, useCameraOrigin) {
    if (!canShoot) return;
    if (!camera) return;
    canShoot = false;
    setTimeout(() => (canShoot = true), 70);

    const bullet = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 1.2, 12),
      new THREE.MeshStandardMaterial({ color: 0xffd452, emissive: 0xffc24a, emissiveIntensity: 0.8 })
    );
    bullet.castShadow = true;

    const start = new THREE.Vector3();
    if (useCameraOrigin) {
      camera.getWorldPosition(start);
    } else {
      player.gunTip.getWorldPosition(start);
    }
    bullet.position.copy(start);

    const cameraPos = new THREE.Vector3();
    camera.getWorldPosition(cameraPos);

    const cameraDir = new THREE.Vector3();
    camera.getWorldDirection(cameraDir);

    const raycaster = new THREE.Raycaster();
    raycaster.set(cameraPos, cameraDir);

    const intersects = raycaster.intersectObjects(scene.children, true);
    const validIntersects = intersects.filter((hit) => !isChildOf(hit.object, player.group));

    const targetPoint = new THREE.Vector3();
    if (validIntersects.length > 0) {
      targetPoint.copy(validIntersects[0].point);
    } else {
      targetPoint.copy(cameraPos).addScaledVector(cameraDir, 140);
    }

    const direction = new THREE.Vector3().subVectors(targetPoint, start).normalize();
    bullet.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

    bullets.push({ mesh: bullet, direction, life: 2.2 });
    scene.add(bullet);

    if (muzzleLight) {
      player.gunTip.getWorldPosition(muzzleLight.position);
    }
  }

  function onShoot(camera, useCameraOrigin) {
    spawnBullet(camera, useCameraOrigin);
  }

  function update(delta, camera, useCameraOrigin) {
    if (isFiring && fireCooldown <= 0) {
      spawnBullet(camera, useCameraOrigin);
      fireCooldown = 0.08;
    }
    fireCooldown = Math.max(0, fireCooldown - delta);
    // Determine the active model and mixer based on movement inputs (strafe direction)
    let activeModel = player.idleModel;
    let activeMixer = player.idleMixer;

    if (input.forward) {
      activeModel = player.runForwardModel;
      activeMixer = player.runForwardMixer;
    } else if (input.back) {
      activeModel = player.runBackwardModel;
      activeMixer = player.runBackwardMixer;
    } else if (input.left) {
      activeModel = player.runLeftModel;
      activeMixer = player.runLeftMixer;
    } else if (input.right) {
      activeModel = player.runRightModel;
      activeMixer = player.runRightMixer;
    }

    // Update visibility for all 5 models to ensure only the active one is seen
    const allModels = [
      player.idleModel,
      player.runForwardModel,
      player.runLeftModel,
      player.runRightModel,
      player.runBackwardModel
    ];

    allModels.forEach((m) => {
      if (m) {
        m.visible = (m === activeModel);
      }
    });

    // Update the active animation mixer
    if (activeMixer) {
      activeMixer.update(delta);
    } else {
      // Fallback
      if (player.mixer) {
        player.mixer.update(delta);
      }
    }

    updateMovement(delta);
    updateBullets(delta);
    updateTargets(delta);
  }

  function setFiring(state) {
    isFiring = state;
  }

  function updateMovement(delta) {
    const speed = 12;
    const move = new THREE.Vector3();
    if (input.forward) move.z -= 1;
    if (input.back) move.z += 1;
    if (input.left) move.x -= 1;
    if (input.right) move.x += 1;

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(speed * delta);
      move.applyQuaternion(player.group.quaternion);
      player.group.position.add(move);
      player.group.position.x = THREE.MathUtils.clamp(player.group.position.x, -110, 110);
      player.group.position.z = THREE.MathUtils.clamp(player.group.position.z, -110, 110);
    }
  }

  function updateBullets(delta) {
    bullets.forEach((bullet) => {
      bullet.mesh.position.addScaledVector(bullet.direction, 60 * delta);
      bullet.life -= delta;
    });

    for (let i = bullets.length - 1; i >= 0; i -= 1) {
      const bullet = bullets[i];
      if (bullet.life <= 0) {
        scene.remove(bullet.mesh);
        bullets.splice(i, 1);
      }
    }

    checkCollisions();
  }

  function checkCollisions() {
    bullets.forEach((bullet) => {
      targets.forEach((target) => {
        if (target.hit || target.removing) return;
        const distance = bullet.mesh.position.distanceTo(target.group.position);
        if (distance < 3.5) {
          target.hit = true;
          target.removing = true;
          target.hitTimer = 0;
          eliminated += 1;
          if (onScore) onScore(eliminated);
          scene.remove(bullet.mesh);
          bullet.life = 0;
        }
      });
    });
  }

  function updateTargets(delta) {
    targets.forEach((target) => {
      if (!target.removing) return;
      target.hitTimer += delta;
      const t = target.hitTimer;
      if (t < 0.15) {
        const scale = THREE.MathUtils.lerp(1, 1.4, t / 0.15);
        target.group.scale.setScalar(scale);
      } else {
        const scale = THREE.MathUtils.lerp(1.4, 0, (t - 0.15) / 0.35);
        target.group.scale.setScalar(Math.max(scale, 0));
        if (t >= 0.5) {
          scene.remove(target.group);
          target.removing = false;
        }
      }
    });
  }

  function resetGame() {
    bullets.forEach((bullet) => scene.remove(bullet.mesh));
    bullets.length = 0;

    targets.forEach((target) => {
      target.hit = false;
      target.removing = false;
      target.hitTimer = 0;
      target.group.scale.setScalar(1);
      if (target.group.parent !== scene) {
        scene.add(target.group);
      }
    });

    eliminated = 0;
    if (onScore) onScore(eliminated);

    rotation.yaw = initialPlayer.rotationY;
    rotation.pitch = 0;
    player.group.rotation.y = rotation.yaw;
    player.group.position.copy(initialPlayer.position);

    // Reset visibility of all 5 models (only idleModel visible)
    const allModels = [
      player.idleModel,
      player.runForwardModel,
      player.runLeftModel,
      player.runRightModel,
      player.runBackwardModel
    ];
    allModels.forEach((m) => {
      if (m) {
        m.visible = (m === player.idleModel);
        m.rotation.y = Math.PI;
      }
    });
  }

  return {
    onKeyDown: (event) => onKey(event, true),
    onKeyUp: (event) => onKey(event, false),
    onMouseMove,
    onShoot,
    update,
    setFiring,
    reset: resetGame,
    getPitch: () => rotation.pitch,
  };
}
