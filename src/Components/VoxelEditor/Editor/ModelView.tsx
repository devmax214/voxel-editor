import { useEffect, useState } from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
import { MTLLoader, OBJLoader, mergeVertices } from "three-stdlib";
import { ContactShadows } from "@react-three/drei";
import { useProjectContext } from "@/contexts/projectContext";
import { ProjectStatus } from "utils/types";

const ModelView = ({
  projectId
} : {
  projectId: string
}) => {
  const { projects } = useProjectContext();
  const current = projects.filter(project => project.id === projectId)[0];
  const [urls, setUrls] = useState({
    obj: '',
    mtl: '',
    albedo: '',
    metallic: '',
    roughness: ''
  });

  const baseURL = `${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/getAsset?projectId=${projectId}&fileName=`;

  useEffect(() => {
    if ((current?.status === ProjectStatus.MaterialCompleted || current?.status === ProjectStatus.GeometryEditing) && current?.modelGenerated) {
      setUrls({
        obj: `${baseURL}model.obj`,
        mtl: `${baseURL}model.mtl`,
        albedo: `${baseURL}texture_kd.jpg`,
        metallic: `${baseURL}texture_metallic.jpg`,
        roughness: `${baseURL}texture_roughness.jpg`
      });
    }
  }, [current, baseURL]);

  // const { nodes, materials } = useGLTF("/models/model1.glb");
  // // if (!mesh)
  // //   return null;
  // const material = materials.default;
  // let geometry = (nodes.object as THREE.Mesh).geometry as THREE.BufferGeometry;
  // geometry.deleteAttribute("normal");
  // geometry = mergeVertices(geometry);
  // geometry.computeVertexNormals();
  // material.side = THREE.DoubleSide;

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
  // const bounds = new THREE.Box3().setFromObject(nodes.object as THREE.Mesh);

  return (
    <>
      {urls.obj ?
      // <mesh
      //   rotation={[Math.PI * 3 / 2, 0, 0]}
      //   geometry={mesh}
      //   material={Material}
      // />
      <group>
        <mesh
          castShadow
          receiveShadow
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
        {/* <mesh
          castShadow
          rotation={[Math.PI * 3 / 2, 0, 0]}
          geometry={geometry}
          material={material}
        /> */}
        {/* <AccumulativeShadows frames={200} alphaTest={0.7} scale={10} position={[0, bounds.min.z, 0]}>
          <RandomizedLight amount={4} radius={9} intensity={2} ambient={0.25} position={[0, 10, 0]} />
          <RandomizedLight amount={4} radius={5} intensity={1} ambient={0.55} position={[0, 5, 0]} />
        </AccumulativeShadows> */}
        <ContactShadows blur={2} scale={10} far={20} resolution={256} position={[0, bounds.min.z, 0]} />
      </group>
      :
      <group></group>}
    </>
  )
}

export default ModelView;