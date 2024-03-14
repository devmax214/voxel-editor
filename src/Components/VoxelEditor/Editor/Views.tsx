import { Suspense } from "react";
import { useParams } from "next/navigation";
import { Html, OrbitControls } from "@react-three/drei";
import VoxelView from "./VoxelView";
import MeshView from "./MeshView";
import ModelView from "./ModelView";
import { useBasicStore } from "@/store";

const Views: React.FC = () => {
  const params = useParams();
  const projectId = params?.projectId as string;
  const { viewMode } = useBasicStore();

  return (
    <>
      {viewMode === 'voxel' && <Suspense fallback={<Html center><p className="text-2xl">Loading...</p></Html>}>
        <VoxelView projectId={projectId} />
      </Suspense>}
      {viewMode === 'mesh' && <Suspense fallback={<Html center><p className="text-2xl">Loading...</p></Html>}>
        <MeshView projectId={projectId} />
      </Suspense>}
      {viewMode === 'model' && <>
        <Suspense fallback={<Html center><p className="text-2xl">Loading...</p></Html>}>
          <ModelView projectId={projectId} />
        </Suspense>
        <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
      </>}
    </>
  )
}

export default Views;