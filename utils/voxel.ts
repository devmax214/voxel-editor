import * as THREE from "three";
import { MeshBVH } from "three-mesh-bvh";

export const Material = new THREE.MeshPhysicalMaterial({ color: 0x00ff00, wireframe: false, side: THREE.DoubleSide, roughness: 0.5, metalness: 0.5 });

export function voxelizeMesh(geometry: THREE.BufferGeometry, gridSize: number) {
  const mesh = new THREE.Mesh(geometry, Material);
  const bvh = new MeshBVH( geometry );
  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
	const scale = new THREE.Vector3().setScalar( gridSize );
	const worldMatrix = new THREE.Matrix4();
  const box = new THREE.Box3();
  const invMat = new THREE.Matrix4();
  invMat.copy( mesh.matrixWorld ).invert();

  const ray = new THREE.Ray();
	ray.direction.set( 0, 0, 1 );

  const boundingBox = new THREE.Box3().setFromObject(mesh);
  let voxels: THREE.Vector3[] = [];

  for (let i = boundingBox.min.x; i < boundingBox.max.x; i += gridSize) {
    for (let j = boundingBox.min.y; j < boundingBox.max.y; j += gridSize) {
      for (let k = boundingBox.min.z; k < boundingBox.max.z; k += gridSize) {
        position.set(i, j, k);

        box.min.setScalar(-0.5 * gridSize).add(position);
        box.max.setScalar(0.5 * gridSize).add(position);

        // surface only
        const res = bvh.intersectsBox(box, invMat);
        if (res) {
          worldMatrix.compose( position, quaternion, scale );
          const newPos = new THREE.Vector3();
          newPos.setFromMatrixPosition(worldMatrix);
          voxels.push(newPos);
        }

        // all
        // ray.origin.copy(position).applyMatrix4(invMat);
        // const res = bvh.raycastFirst(ray, 2);
        // if (res && res.face && res.face.normal.dot(ray.direction) > 0) {
        //   worldMatrix.compose( position, quaternion, scale );
        //   const newPos = new THREE.Vector3();
        //   newPos.setFromMatrixPosition(worldMatrix);
        //   voxels.push(newPos);
        // }
      }
    }
  }

  return voxels;
}

