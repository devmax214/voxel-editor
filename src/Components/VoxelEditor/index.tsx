'use client';
import React, { useLayoutEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { Raycaster } from 'three/src/core/Raycaster';
import "@/Components/VoxelEditor/global.css";

const scene = new THREE.Scene();


const wireframe = false;

class Voxels3D {
  constructor(n1, n2, n3, xMin = -1, xMax = 1, yMin = -1, yMax = 1, zMin = -1, zMax = 1) {
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

  setFromFunction(f) {
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

  setFromMesh(mesh) {
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
          for (let i = 0; i < intersects.length; i++) {
            let sgn = 1;
            if (intersects[i].face.normal.x < 0) {
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

  getVoxelId(i, j, k) {
    return i + this.n1 * j + this.n1 * this.n2 * k;
  }

  getFaceXId(i, j, k) {
    return i + (this.n1 + 1) * j + (this.n1 + 1) * this.n2 * k;
  }

  getFaceYId(i, j, k) {
    return i + this.n1 * j + this.n1 * (this.n2 + 1) * k;
  }

  getFaceZId(i, j, k) {
    return i + this.n1 * j + this.n1 * this.n2 * k;
  }

  getXYZ(i, j, k) {
    return [this.xMin + i * (this.xMax - this.xMin) / this.n1,
    this.yMin + j * (this.yMax - this.yMin) / this.n2,
    this.zMin + k * (this.zMax - this.zMin) / this.n3];
  }

  getIJK(id) {
    let k = Math.floor(id / (this.n1 * this.n2));
    id -= k * this.n1 * this.n2;
    let j = Math.floor(id / this.n1);
    let i = id - j * this.n1;
    return [i, j, k];
  }

  getValue(i, j, k) {
    return this.voxels[i + this.n1 * j + this.n1 * this.n2 * k];
  }

  setValue(i, j, k, value) {
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

  addXFacesToScene(scene) {
    const material = new THREE.MeshPhongMaterial({ color: 0xff0000, wireframe: wireframe });
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

  addYFacesToScene(scene) {
    const material = new THREE.MeshPhongMaterial({ color: 0xff0000, wireframe: wireframe });
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

  addZFacesToScene(scene) {
    const material = new THREE.MeshPhongMaterial({ color: 0xff0000, wireframe: wireframe });
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

  addFacesToScene(scene) {
    this.addXFacesToScene(scene);
    this.addYFacesToScene(scene);
    this.addZFacesToScene(scene);
  }

  addVoxelsToScene(scene) {
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00, wireframe: wireframe });
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

const VoxelEditor = () => {
  const [render, setRender] = useState(false);
  // define  a n1xn2xn3 array of boolean values for representing voxels

  const v3d = new Voxels3D(32, 32, 32);

  function f(x, y, z) {
    return x * x - y * y - +z * z + .4;
  }

  //v3d.setFromFunction(f);


  function add_voxels_to_scene(x_min, x_max, y_min, y_max, z_min, z_max) {
    // add voxels to scene with the given bounds

    // create a material
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00, wireframe: false });
    // show back faces
    // create a geometry
    const geometry = new THREE.BoxGeometry((x_max - x_min) / this.n1, (y_max - y_min) / this.n2, (z_max - z_min) / this.n3);

    // create a mesh for each voxel

    for (let i = 0; i < this.n1; i++) {
      for (let j = 0; j < this.n2; j++) {
        for (let k = 0; k < this.n3; k++) {
          if (v3d.getValue(i, j, k)) {
            const cube = new THREE.Mesh(geometry, material);
            let x = x_min + i * (x_max - x_min) / this.n1;
            let y = y_min + j * (y_max - y_min) / this.n2;
            let z = z_min + k * (z_max - z_min) / this.n3;
            cube.position.set(x, y, z);
            scene.add(cube);
          }
        }
      }
    }
  }


  function loadPLYFile(file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const arrayBuffer = event.target.result;
      const loader = new PLYLoader();
      const geometry = loader.parse(arrayBuffer);
      geometry.computeVertexNormals();
      const material = new THREE.MeshPhongMaterial({ color: 0x00ff00, wireframe: false });
      material.side = THREE.DoubleSide;

      material.transparent = true;
      material.opacity = 0.5;
      const mesh = new THREE.Mesh(geometry, material);
      // get the bounding box
      const box = new THREE.Box3();
      box.setFromObject(mesh);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      console.log("Size", size);
      console.log("Center", center);

      const lambda = 0.6;
      const xMin = center.x - lambda * size.x;
      const xMax = center.x + lambda * size.x;
      const yMin = center.y - lambda * size.y;
      const yMax = center.y + lambda * size.y;
      const zMin = center.z - lambda * size.z;
      const zMax = center.z + lambda * size.z;
      const res = 43;
      const v3d = new Voxels3D(res, res, res, xMin, xMax, yMin, yMax, zMin, zMax);
      // add bounding box to scene
      const boxHelper = new THREE.BoxHelper(mesh, 0xffff00);
      //scene.add(boxHelper);
      // add bounding box for xMin, xMax, yMin, yMax, zMin, zMax
      const material2 = new THREE.MeshPhongMaterial({
        color: 0x00ff00,
        wireframe: false,
        transparent: true,
        opacity: 0.25
      });
      const geometry2 = new THREE.BoxGeometry(xMax - xMin, yMax - yMin, zMax - zMin);
      const cube = new THREE.Mesh(geometry2, material2);
      cube.position.set(center.x, center.y, center.z);
      // remove all objects from scene
      //scene.remove.apply(scene, scene.children);
      //scene.add(cube);
      //scene.add(mesh);
      v3d.setFromMesh(mesh);
      v3d.addFacesToScene(scene);

    };
    reader.readAsArrayBuffer(file);
  }

  let flag = false;

  useLayoutEffect(() => {
    if (!flag) {
      document.getElementById('plyUpload').addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (!file) {
          return;
        }
        loadPLYFile(file);
      }
      );

      // Create a scene

      // Create a camera
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 5;

      // Create a renderer
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);

      // add on windows update
      window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
      });

      document.body.appendChild(renderer.domElement);
      flag = true;
      console.log('1')
      // Add lights
      const light = new THREE.AmbientLight(0x404040); // soft white light
      scene.add(light);
      // add directional lights
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);
      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight2.position.set(-1, -1, 1);
      scene.add(directionalLight2);


      //v3d.addVoxelsToScene(scene);
      //v3d.addFacesToScene(scene);


      // Add orbit controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.update();

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);

        // Rotate the cube
        //cube.rotation.x += 0.01;
        //cube.rotation.y += 0.01;

        renderer.render(scene, camera);
      };

      animate();

    }
  }, [])

  return (
    <>
      <input type='file' id="plyUpload" accept=".ply" />
      <div id="app"></div>
    </>
  )
}

export default VoxelEditor;