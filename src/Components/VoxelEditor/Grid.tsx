import * as THREE from "three";
import React, { useEffect, useRef } from "react";
import { extend, useThree } from "@react-three/fiber";
import { GridHelper } from "three";
extend({ GridHelper });

interface GridProps {
  size?: number;
  divisions?: number;
  colorCenterLine?: string | number | THREE.Color;
  colorGrid?: string | number | THREE.Color;
}

const Grid: React.FC<GridProps> = ({
  size = 10,
  divisions = 10,
  colorCenterLine = 0x000000,
  colorGrid = 0x000000,
}) => {
  const gridRef = useRef<THREE.GridHelper>();
  const { scene } = useThree();

  useEffect(() => {
    const ref = gridRef.current;

    if (ref) {
      scene.add(ref);
    }

    return () => {
      if (ref) {
        scene.remove(ref);
      }
    };
  }, [scene]);

  return (
    <primitive
      ref={gridRef}
      object={new THREE.GridHelper(size, divisions, colorCenterLine, colorGrid)}
      position={[0, 0, 0]}
    />
  );
}

export default Grid;