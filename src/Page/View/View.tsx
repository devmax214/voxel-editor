'use client'

import React, { useEffect, useState, Suspense } from 'react';
import * as THREE from "three";
import { useParams } from "next/navigation";
import { useCompletedProjects } from '@/store';
import { Canvas, useThree, useLoader } from '@react-three/fiber';
import { Environment, PerspectiveCamera, Html, ContactShadows, OrbitControls } from '@react-three/drei';
import { mergeVertices, OBJLoader, MTLLoader } from "three-stdlib";
import { Spinner } from '@chakra-ui/react';

const SceneBackground: React.FC = () => {
  const { scene } = useThree();

  useEffect(() => {
    scene.background = new THREE.Color('lightgrey');
  }, [scene]);

  return null;
}

const View: React.FC = () => {
  const params = useParams();
  const projectId = params?.projectId as string;
  const { populars } = useCompletedProjects();
  const current = populars.filter(popular => popular.id === projectId)[0];
  const [urls, setUrls] = useState({
    obj: '',
    mtl: '',
    albedo: '',
    metallic: '',
    roughness: ''
  });

  const baseURL = `${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/getAsset?projectId=${projectId}&fileName=`;

  useEffect(() => {
    if (current?.status === 'Completed') {
      setUrls({
        obj: `${baseURL}model.obj`,
        mtl: `${baseURL}model.mtl`,
        albedo: `${baseURL}texture_kd.jpg`,
        metallic: `${baseURL}texture_metallic.jpg`,
        roughness: `${baseURL}texture_roughness.jpg`
      });
    }
  }, [current]);

  const materials = useLoader(MTLLoader, urls.mtl);
  const obj = useLoader(
    OBJLoader,
    urls.obj,
    (model) => {
      if (model) {
        model.setMaterials(materials);
      }
      return model;
    }
  );

  const metallicnessMap = useLoader(THREE.TextureLoader, urls.metallic);
  const roughnessMap = useLoader(THREE.TextureLoader, urls.roughness);
  const textureMap = useLoader(THREE.TextureLoader, urls.albedo);

  if (!obj.children) return null;

  let objMesh = obj.children[0] as THREE.Mesh;
  let geometry = objMesh.geometry;
  geometry.deleteAttribute("normal");
  geometry = mergeVertices(geometry);
  geometry.computeVertexNormals();

  const bounds = new THREE.Box3().setFromObject(obj);

  return (
    <div className="canvas">
      <div className="w-full h-full">
        <Canvas
          shadows="soft"
          flat={true}
          dpr={[1, 1]}
          frameloop="demand"
          gl={{ preserveDrawingBuffer: true, powerPreference: 'high-performance', antialias: true }}
        >
          <Environment files="/models/potsdamer_platz_1k.hdr" />
          <SceneBackground />
          <PerspectiveCamera makeDefault position={[0, 1.5, 1.5]} />
          <ambientLight intensity={0.5 * Math.PI} />
          <directionalLight castShadow position={[2.5, 4, 5]} intensity={3} shadow-mapSize={1024}>
            <orthographicCamera attach="shadow-camera" args={[-10, 10, -10, 10, 0.1, 50]} />
          </directionalLight>
          <Suspense fallback={<Html center><p className="text-2xl">Loading...</p></Html>}>
            {urls.obj ?
              <group>
                <mesh
                  castShadow
                  receiveShadow
                  rotation={[Math.PI * 3 / 2, 0, 0]}
                  geometry={geometry}
                >
                  <meshPhysicalMaterial
                    side={THREE.DoubleSide}
                    attach={'material'}
                    map={textureMap}
                    roughnessMap={roughnessMap}
                    metalnessMap={metallicnessMap}
                  />
                </mesh>
                <ContactShadows blur={2} scale={10} far={20} resolution={256} position={[0, bounds.min.z, 0]} />
              </group>
              :
              <group></group>}
          </Suspense>
          <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
        </Canvas>
      </div>
    </div>
  );
}

export default View;
