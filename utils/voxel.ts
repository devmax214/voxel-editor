import * as THREE from "three";

export type Voxel = {
  position: THREE.Vector3,
  size: [number, number, number];
};

export function voxelizeMesh(mesh: THREE.Mesh, gridSize: number) {
  const boundingBox = new THREE.Box3().setFromObject(mesh);
  let voxels: Voxel[] = [];

  for (let i = boundingBox.min.x; i < boundingBox.max.x; i += gridSize) {
    for (let j = boundingBox.min.y; j < boundingBox.max.y; j += gridSize) {
      for (let k = boundingBox.min.z; k < boundingBox.max.z; k += gridSize) {
        const pos = new THREE.Vector3(i, j, k);
        if (isInsideMesh(pos, mesh)) {
          voxels.push({
            position: pos,
            size: [gridSize, gridSize, gridSize]
          });
        }
      }
    }
  }

  return voxels;
}

function isInsideMesh(pos: THREE.Vector3, mesh: THREE.Mesh) {
  const rayCaster = new THREE.Raycaster();
  rayCaster.set(pos, new THREE.Vector3(0, -1, 0));
  const rayCasterIntersects = rayCaster.intersectObject(mesh, false);
  return rayCasterIntersects.length % 2 === 1;
}