import { useEffect } from 'react';
import * as THREE from "three";
import { useThree } from '@react-three/fiber';

const SceneBackground: React.FC = () => {
  const { scene } = useThree();

  useEffect(() => {
    scene.background = new THREE.Color('lightgrey');
  }, [scene]);

  return null;
}

export default SceneBackground;
