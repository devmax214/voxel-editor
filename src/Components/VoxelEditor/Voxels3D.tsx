import * as THREE from "three";
import { Raycaster } from "three";

const wireframe = false;

export default class Voxels3D {
  private n1: number;
  private n2: number;
  private n3: number;
  private xMin: number;
  private xMax: number;
  private yMin: number;
  private yMax: number;
  private zMin: number;
  private zMax: number;
  private voxels: boolean[];
  private xFaces: number[];
  private yFaces: number[];
  private zFaces: number[];
  private xFacesOn: number[][];
  private yFacesOn: number[][];
  private zFacesOn: number[][];

  constructor(n1: number, n2: number, n3: number, xMin = -1, xMax = 1, yMin = -1, yMax = 1, zMin = -1, zMax = 1) {
    this.n1 = n1;
    this.n2 = n2;
    this.n3 = n3;
    this.xMin = xMin;
    this.xMax = xMax;
    this.yMin = yMin;
    this.yMax = yMax;
    this.zMin = zMin;
    this.zMax = zMax;
    this.voxels = new Array(n1 * n2 * n3).fill(false);
    this.xFaces = new Array((n1 + 1) * n2 * n3).fill(0);
    this.yFaces = new Array(n1 * (n2 + 1) * n3).fill(0);
    this.zFaces = new Array(n1 * n2 * (n3 + 1)).fill(0);
    this.xFacesOn = []
    this.yFacesOn = []
    this.zFacesOn = []
  }

  updateFacesOn() {
    this.xFacesOn = []
    for (let i = 0; i < this.n1 + 1; i++) {
      for (let j = 0; j < this.n2; j++) {
        for (let k = 0; k < this.n3; k++) {
          if (this.xFaces[this.getFaceXId(i, j, k)] !== 0) {
            this.xFacesOn.push([i, j, k])
          }
        }
      }
    }
    this.yFacesOn = []
    for (let i = 0; i < this.n1; i++) {
      for (let j = 0; j < this.n2 + 1; j++) {
        for (let k = 0; k < this.n3; k++) {
          if (this.yFaces[this.getFaceYId(i, j, k)] !== 0) {
            this.yFacesOn.push([i, j, k])
          }
        }
      }
    }
    this.zFacesOn = []
    for (let i = 0; i < this.n1; i++) {
      for (let j = 0; j < this.n2; j++) {
        for (let k = 0; k < this.n3 + 1; k++) {
          if (this.zFaces[this.getFaceZId(i, j, k)] !== 0) {
            this.zFacesOn.push([i, j, k])
          }
        }
      }
    }
  }

  setFromFunction(f: (x: number, y: number, z: number) => number) {
    for (let i = 0; i < this.n1; i++) {
      for (let j = 0; j < this.n2; j++) {
        for (let k = 0; k < this.n3; k++) {
          let p = this.getXYZ(i, j, k);
          if (f(p[0], p[1], p[2]) < 0) {
            this.setValue(i, j, k, true);
          }
        }
      }
    }
    this.updateFacesOn();
  }

  setFromMesh(mesh: THREE.Mesh) {
    let rayCaster = new Raycaster();
    const rays = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 1, 1]]
    for (let i = 0; i < this.n1; i++) {
      for (let j = 0; j < this.n2; j++) {
        for (let k = 0; k < this.n3; k++) {
          let p = this.getXYZ(i, j, k);
          let ray = rays[0]
          rayCaster.set(new THREE.Vector3(p[0], p[1], p[2]), new THREE.Vector3(ray[0], ray[1], ray[2]));
          const intersects = rayCaster.intersectObject(mesh);
          // iterate over intersections
          let intersectionNumber = 0.0
          for(let i = 0; i < intersects.length; i++) {
            let sgn = 1;
            if (intersects[i].face!.normal.x < 0) {
              sgn *= -1;
            }
            intersectionNumber += sgn;
          }

          let isIn = intersectionNumber === 1
          if (isIn) {
            this.setValue(i, j, k, true);
          }
        }
      }
    }
    this.updateFacesOn();
  }

  clear() {
    this.voxels.fill(false);
    this.xFaces.fill(0);
    this.yFaces.fill(0);
    this.zFaces.fill(0);
    this.xFacesOn = []
    this.yFacesOn = []
    this.zFacesOn = []
  }

  getVoxelId(i: number, j: number, k: number) {
    return i + this.n1 * j + this.n1 * this.n2 * k;
  }

  getFaceXId(i: number, j: number, k: number) {
    return i + (this.n1 + 1) * j + (this.n1 + 1) * this.n2 * k;
  }

  getFaceYId(i: number, j: number, k: number) {
    return i + this.n1 * j + this.n1 * (this.n2 + 1) * k;
  }

  getFaceZId(i: number, j: number, k: number) {
    return i + this.n1 * j + this.n1 * this.n2 * k;
  }

  getXYZ(i: number, j: number, k: number) {
    return [this.xMin + i * (this.xMax - this.xMin) / this.n1,
      this.yMin + j * (this.yMax - this.yMin) / this.n2,
      this.zMin + k * (this.zMax - this.zMin) / this.n3];
  }

  getIJK(id: number) {
    let k = Math.floor(id / (this.n1 * this.n2));
    id -= k * this.n1 * this.n2;
    let j = Math.floor(id / this.n1);
    let i = id - j * this.n1;
    return [i, j, k];
  }

  getValue(i: number, j: number, k: number) {
    return this.voxels[i + this.n1 * j + this.n1 * this.n2 * k];
  }

  setValue(i: number, j: number, k: number, value: boolean) {
    const ijk_id = this.getVoxelId(i, j, k);
    const currentValue = this.voxels[ijk_id];
    if (currentValue !== value) {
        this.voxels[ijk_id] = value;
        if (value) {
            this.xFaces[this.getFaceXId(i + 1, j, k)] += 1;
            this.xFaces[this.getFaceXId(i, j, k)] -= 1;
            this.yFaces[this.getFaceYId(i, j + 1, k)] += 1;
            this.yFaces[this.getFaceYId(i, j, k)] -= 1;
            this.zFaces[this.getFaceZId(i, j, k + 1)] += 1;
            this.zFaces[this.getFaceZId(i, j, k)] -= 1;
        } else {
            this.xFaces[ijk_id] += 1;
            this.xFaces[this.getVoxelId(i + 1, j, k)] -= 1;
            this.yFaces[ijk_id] += 1;
            this.yFaces[this.getVoxelId(i, j + 1, k)] -= 1;
            this.zFaces[ijk_id] += 1;
            this.zFaces[this.getVoxelId(i, j, k + 1)] -= 1;
        }
    }
  }

  addXFacesToScene(scene: THREE.Scene) {
    const material = new THREE.MeshPhongMaterial({color: 0xff0000, wireframe: wireframe});
    const geometry = new THREE.BoxGeometry(0.01, (this.yMax - this.yMin) / this.n2, (this.zMax - this.zMin) / this.n3);
    for (let ijk of this.xFacesOn) {
      const cube = new THREE.Mesh(geometry, material);
      let x = this.xMin + (ijk[0] - .5) * (this.xMax - this.xMin) / this.n1;
      let y = this.yMin + ijk[1] * (this.yMax - this.yMin) / this.n2;
      let z = this.zMin + ijk[2] * (this.zMax - this.zMin) / this.n3;
      cube.position.set(x, y, z);
      scene.add(cube);
    }
  }

  addYFacesToScene(scene: THREE.Scene) {
    const material = new THREE.MeshPhongMaterial({color: 0xff0000, wireframe: wireframe});
    const geometry = new THREE.BoxGeometry((this.xMax - this.xMin) / this.n1, 0.01, (this.zMax - this.zMin) / this.n3);
    for (let ijk of this.yFacesOn) {
      const cube = new THREE.Mesh(geometry, material);
      let x = this.xMin + ijk[0] * (this.xMax - this.xMin) / this.n1;
      let y = this.yMin + (ijk[1] - .5) * (this.yMax - this.yMin) / this.n2;
      let z = this.zMin + ijk[2] * (this.zMax - this.zMin) / this.n3;
      cube.position.set(x, y, z);
      scene.add(cube);
    }
  }

  addZFacesToScene(scene: THREE.Scene) {
    const material = new THREE.MeshPhongMaterial({color: 0xff0000, wireframe: wireframe});
    const geometry = new THREE.BoxGeometry((this.xMax - this.xMin) / this.n1, (this.yMax - this.yMin) / this.n2, 0.01);
    for (let ijk of this.zFacesOn) {
      const cube = new THREE.Mesh(geometry, material);
      let x = this.xMin + ijk[0] * (this.xMax - this.xMin) / this.n1;
      let y = this.yMin + ijk[1] * (this.yMax - this.yMin) / this.n2;
      let z = this.zMin + (ijk[2] - .5) * (this.zMax - this.zMin) / this.n3;
      cube.position.set(x, y, z);
      scene.add(cube);
    }
  }

  addFacesToScene(scene: THREE.Scene) {
    this.addXFacesToScene(scene);
    this.addYFacesToScene(scene);
    this.addZFacesToScene(scene);
  }

  addVoxelsToScene(scene: THREE.Scene) {
    const material = new THREE.MeshPhongMaterial({color: 0x00ff00, wireframe: wireframe});
    const geometry = new THREE.BoxGeometry((this.xMax - this.xMin) / this.n1, (this.yMax - this.yMin) / this.n2, (this.zMax - this.zMin) / this.n3);
    for (let i = 0; i < this.n1; i++) {
        for (let j = 0; j < this.n2; j++) {
            for (let k = 0; k < this.n3; k++) {
                if (this.getValue(i, j, k)) {
                    const cube = new THREE.Mesh(geometry, material);
                    let x = this.xMin + i * (this.xMax - this.xMin) / this.n1;
                    let y = this.yMin + j * (this.yMax - this.yMin) / this.n2;
                    let z = this.zMin + k * (this.zMax - this.zMin) / this.n3;
                    cube.position.set(x, y, z);
                    scene.add(cube);
                }
            }
        }
    }
  }
}