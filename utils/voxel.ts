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

function round(val: number) {
  return parseFloat(Number(val).toFixed(10));
}

export function generatePointCloud(voxels: THREE.Vector3[], gridSize: number) {
  let pointSet = new Set();

  for (let i = 0; i < voxels.length; i++) {
    const {x, y, z} = voxels[i];
    // const x = parseFloat(Number(voxels[i].x).toFixed(10));
    // const y = parseFloat(Number(voxels[i].y).toFixed(10));
    // const z = parseFloat(Number(voxels[i].z).toFixed(10));

    // add corners of each voxel
    pointSet.add([x, y, z]);
    pointSet.add([x, y + gridSize, z]);
    pointSet.add([x, y, z + gridSize]);
    pointSet.add([x, y + gridSize, z + gridSize]);
    pointSet.add([x + gridSize, y, z]);
    pointSet.add([x + gridSize, y + gridSize, z]);
    pointSet.add([x + gridSize, y, z + gridSize]);
    pointSet.add([x + gridSize, y + gridSize, z + gridSize]);
    // pointSet.add([round(x), round(y), round(z)]);
    // pointSet.add([round(x), round(y + gridSize), round(z)]);
    // pointSet.add([round(x), round(y), round(z + gridSize)]);
    // pointSet.add([round(x), round(y + gridSize), round(z + gridSize)]);
    // pointSet.add([round(x + gridSize), round(y), round(z)]);
    // pointSet.add([round(x + gridSize), round(y + gridSize), round(z)]);
    // pointSet.add([round(x + gridSize), round(y), round(z + gridSize)]);
    // pointSet.add([round(x + gridSize), round(y + gridSize), round(z + gridSize)]);
    
    // add center of each voxel
    pointSet.add([x + gridSize / 2, y + gridSize / 2, z + gridSize / 2]);
    // pointSet.add([round(x + gridSize / 2), round(y + gridSize / 2), round(z + gridSize / 2)]);
  }

  const pointCloud = Array.from(pointSet);
  return pointCloud;
}