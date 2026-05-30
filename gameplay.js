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

  // ---- Load 3D FBX Character Model ----
  const manager = new THREE.LoadingManager();

  manager.onStart = () => {
    showStatus("⏳ Loading character model...");
  };
  manager.onProgress = (url, loaded, total) => {
    const pct = Math.round((loaded / total) * 100);
    showStatus(`⏳ Loading character model... ${pct}%`);
  };
  manager.onLoad = () => {
    showStatus("");
  };
  manager.onError = (url) => {
    showStatus(`⚠ Failed to load: ${url}`);
    setTimeout(() => showStatus(""), 5000);
  };

  const fbxLoader = new FBXLoader(manager);
  fbxLoader.load(
    "assets/models/Ch49_nonPBR.fbx",
    (fbx) => {
      // Scale: FBX is in cm, game units are metres-ish. 
      // 170cm character → scale 0.028 ≈ 4.8 units tall (fits well in scene).
      fbx.scale.setScalar(0.028);
      fbx.position.set(0, 0, 0);
      fbx.rotation.y = Math.PI; // face camera-forward direction

      fbx.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          // Improve material quality
          if (child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((m) => {
              m.metalness = 0.1;
              m.roughness = 0.7;
            });
          }
        }
      });

      group.add(fbx);

      // Hide fallback primitives now that the model is loaded
      torso.visible = false;
      head.visible = false;
      gun.visible = false;

      // Reposition gunTip to align with weapon in the right hand of the FBX rig.
      // FBX scale 0.028: weapon barrel tip sits roughly at local (0.6, 3.5, -3.0)
      gunTip.position.set(0.6, 3.5, -3.0);
    }
  );

  group.position.set(0, 0, 30);
  scene.add(group);

  return { group, gunTip };
}


export function createGameplay({ scene, player, targets, onScore, muzzleLight }) {
  const bullets = [];
  const input = { forward: false, back: false, left: false, right: false };
  const rotation = { yaw: 0, pitch: 0 };
  let eliminated = 0;
  let canShoot = true;
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

  function onShoot(camera, useCameraOrigin) {
    if (!canShoot) return;
    if (!camera) return;
    canShoot = false;
    setTimeout(() => (canShoot = true), 180);

    const bullet = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0xff3b3b, emissive: 0x8f1a1a, emissiveIntensity: 0.6 })
    );
    bullet.castShadow = true;

    // Bullet starts at the character's gunTip
    const start = new THREE.Vector3();
    player.gunTip.getWorldPosition(start);
    bullet.position.copy(start);

    // Perform a raycast from camera center to find the target point in the scene
    const cameraPos = new THREE.Vector3();
    camera.getWorldPosition(cameraPos);
    
    const cameraDir = new THREE.Vector3();
    camera.getWorldDirection(cameraDir);
    
    const raycaster = new THREE.Raycaster();
    raycaster.set(cameraPos, cameraDir);
    
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    // Find first intersection that is not part of the player character
    const validIntersects = intersects.filter(hit => !isChildOf(hit.object, player.group));
    
    const targetPoint = new THREE.Vector3();
    if (validIntersects.length > 0) {
      targetPoint.copy(validIntersects[0].point);
    } else {
      // Default to a point 100 units in front of the camera
      targetPoint.copy(cameraPos).addScaledVector(cameraDir, 100);
    }
    
    // Direction is from gunTip to the targetPoint
    const direction = new THREE.Vector3().subVectors(targetPoint, start).normalize();

    bullets.push({ mesh: bullet, direction, life: 2.5 });
    scene.add(bullet);

    if (muzzleLight) {
      player.gunTip.getWorldPosition(muzzleLight.position);
    }
  }

  function update(delta) {
    updateMovement(delta);
    updateBullets(delta);
    updateTargets(delta);
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
      bullet.mesh.position.addScaledVector(bullet.direction, 40 * delta);
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
  }

  return {
    onKeyDown: (event) => onKey(event, true),
    onKeyUp: (event) => onKey(event, false),
    onMouseMove,
    onShoot,
    update,
    reset: resetGame,
    getPitch: () => rotation.pitch,
  };
}
