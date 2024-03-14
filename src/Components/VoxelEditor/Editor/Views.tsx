import { useEffect, useCallback, Suspense } from "react";
import { useParams } from "next/navigation";
import { useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useToast } from "@chakra-ui/react";
import MeshView from "./MeshView";
import VoxelView from "./VoxelView";
import ModelView from "./ModelView";
import { useAuthContext } from "@/contexts/authContext";
import { useProjectContext } from "@/contexts/projectContext";
import { useBasicStore, useThreeStore } from "@/store";

const Views: React.FC = () => {
  const params = useParams();
  const projectId = params?.projectId as string;
  const { viewMode } = useBasicStore();
  const { voxels, mesh } = useThreeStore();

  return (
    <>
      {viewMode === 'voxel' && <Suspense fallback={<Html center><p className="text-2xl">Loading...</p></Html>}>
        <VoxelView  />
      </Suspense>}
      {viewMode === 'mesh' && <Suspense fallback={<Html center><p className="text-2xl">Loading...</p></Html>}>
        <MeshView mesh={mesh} />
      </Suspense>}
      {viewMode === 'model' && <>
        <Suspense fallback={<Html center><p className="text-2xl">Loading...</p></Html>}>
          <ModelView />
        </Suspense>
        <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
      </>}
    </>
  )
}

export default Views;