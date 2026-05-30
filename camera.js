import * as THREE from "three";

export function createCameras(viewport) {
  const panoramic = new THREE.PerspectiveCamera(55, viewport.aspect, 0.5, 180);
  panoramic.position.set(20, 25, 20);
  panoramic.lookAt(0, 0, 0);

  const thirdPerson = new THREE.PerspectiveCamera(70, viewport.aspect, 0.3, 140);
  thirdPerson.position.set(0, 8, 12);
  thirdPerson.lookAt(0, 3, 0);

  return {
    cameras: [panoramic, thirdPerson],
    activeIndex: 0,
  };
}

export function setActiveCamera(cameraState, index) {
  cameraState.activeIndex = index;
}

export function getActiveCamera(cameraState) {
  return cameraState.cameras[cameraState.activeIndex];
}

export function updateThirdPersonCamera(cameraState, player, pitch = 0) {
  const thirdPerson = cameraState.cameras[1];
  
  // Move the camera closer, just far enough to see the entire character
  const distance = 14; 
  const height = 3.5;
  
  // Calculate camera look direction based on player yaw (rotation.y) and camera pitch
  const dir = new THREE.Vector3(0, 0, -1);
  dir.applyAxisAngle(new THREE.Vector3(1, 0, 0), pitch);
  dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y);
  
  // Target of focus is centered on character upper body
  const target = new THREE.Vector3().copy(player.position);
  target.y += 2.8;
  
  // Position the camera behind the target
  const cameraPosition = new THREE.Vector3().copy(target).addScaledVector(dir, -distance);
  cameraPosition.y += height;
  
  thirdPerson.position.copy(cameraPosition);
  
  // Set the camera to look along the direction vector
  const lookTarget = new THREE.Vector3().copy(cameraPosition).addScaledVector(dir, 30);
  thirdPerson.lookAt(lookTarget);
}

export function updateActiveCameraFromUI(cameraState, values) {
  const active = getActiveCamera(cameraState);
  active.position.set(values.x, values.y, values.z);
  active.near = values.near;
  active.far = values.far;
  active.updateProjectionMatrix();
}

export function handleResize(cameraState, viewport) {
  cameraState.cameras.forEach((camera) => {
    camera.aspect = viewport.aspect;
    camera.updateProjectionMatrix();
  });
}
