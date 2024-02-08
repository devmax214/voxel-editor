import * as THREE from "three";
import React, { useEffect } from "react";
import { extend, useThree } from "@react-three/fiber";
import { AxesHelper } from "three";
extend({ AxesHelper });

interface AxesProps {
  size?: number;
}

const Axes: React.FC<AxesProps> = ({
  size = 3
}) => {
  const { scene } = useThree();

  // Add the axes helper to the scene
  useEffect(() => {
    const axesHelper = new THREE.AxesHelper(size);
    scene.add(axesHelper);

    // Remove the helper when the component is unmounted
    return () => {
      scene.remove(axesHelper);
    };
  }, [size, scene]);

  return null;
}

export default Axes;