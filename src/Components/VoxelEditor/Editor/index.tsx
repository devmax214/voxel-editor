'use client'

import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import InfoBox from "../InfoBox";
import StatusBar from "../StatusBar";
import ToolInfo from "../ToolInfo";
import ModelTip from "../ModelTip";
import SceneBackground from "../SceneBackground";
import Views from "./Views";

const Scene: React.FC = () => {
  return (
    <div className="canvas">
      <InfoBox />
      <StatusBar />
      <ToolInfo />
      <ModelTip />
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
          <Views />
          <OrbitControls makeDefault />
        </Canvas>
      </div>
    </div>
  );
}

export default Scene;