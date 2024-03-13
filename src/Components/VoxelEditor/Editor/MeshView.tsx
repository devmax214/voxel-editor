import { useMemo } from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";

type MeshProps = {
  mesh: THREE.BufferGeometry | null;
}

const MeshView: React.FC<MeshProps> = ({ mesh }) => {
  const aoMap = useLoader(THREE.TextureLoader, "/textures/TerracottaClay001_AO_2K.jpg");
  const colMap = useLoader(THREE.TextureLoader, "/textures/TerracottaClay001_COL_2K.jpg");
  const glossMap = useLoader(THREE.TextureLoader, "/textures/TerracottaClay001_GLOSS_2K.jpg");
  const normalMap = useLoader(THREE.TextureLoader, "/textures/TerracottaClay001_NRM_2K.jpg");
  const metalnessMap = useLoader(THREE.TextureLoader, "/textures/TerracottaClay001_REFL_2K.jpg");

  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    side: THREE.DoubleSide,
    wireframe: false,
    map: colMap,
    aoMap: aoMap,
    normalMap: normalMap,
    specularColorMap: metalnessMap,
    roughnessMap: glossMap,
    reflectivity: 0.5,
    roughness: 0.8,
    metalness: 0.3
  }), [aoMap, colMap, normalMap, metalnessMap, glossMap]);

  if (!mesh) return;

  return (
    <mesh
      rotation={[Math.PI * 3 / 2, 0, 0]}
      geometry={mesh}
      material={material}
    />
  )
}

export default MeshView;