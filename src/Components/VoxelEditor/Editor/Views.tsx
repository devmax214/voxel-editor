import { useEffect, useCallback, Suspense } from "react";
import { useParams } from "next/navigation";
import { useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useToast } from "@chakra-ui/react";
import MeshView from "./MeshView";
import VoxelView from "./VoxelView";
import ModelView from "./ModelView";
import { cropToSquare } from "utils/utils";
import { useAuthContext } from "@/contexts/authContext";
import { useProjectContext } from "@/contexts/projectContext";
import { useBasicStore, useThreeStore } from "@/store";
import { getDownloadURL, ref, getStorage, uploadBytes } from "firebase/storage";
import { voxelCreated, updateVoxel } from "@/Firebase/dbactions";

const Views: React.FC = () => {
  const params = useParams();
  const projectId = params?.projectId as string;
  const { user } = useAuthContext();
  const { projects, updateProject } = useProjectContext();
  const { gl } = useThree();
  const { viewMode, setLoading } = useBasicStore();
  const { voxels, mesh } = useThreeStore();
  const toast = useToast();

  const save = useCallback(async (e: KeyboardEvent) => {
    const current = projects.filter(project => project.id === projectId)[0];
    if (current.status === 'Generating') return;

    if (e.code === "Backslash" && user) {
      e.preventDefault();
      if (viewMode === 'voxel') {
        gl.domElement.toBlob(async (blob) => {
          if (blob) {
            try {
              setLoading(true);
              const croppedBlob = await cropToSquare(blob);
              const storage = getStorage();
              const storageRef = ref(storage, `${projectId}/icon.png`);
              const snapshot = await uploadBytes(storageRef, croppedBlob);
              const iconUrl = await getDownloadURL(storageRef);

              console.log("saved", current);
              const voxelData = voxels.map(voxel => ({ x: voxel.x, y: voxel.y, z: voxel.z }));
              if (current.voxelData.length === 0) {
                const res: any = await voxelCreated(user.uid, projectId, 0, voxelData, iconUrl, current.prompt);
                updateProject(projectId, { status: res.project.status, voxelData: voxelData, lastModified: new Date().toISOString() });
              } else {
                const res = await updateVoxel(projectId, voxelData, "Editing", current.prompt);
                updateProject(projectId, { status: "Editing", voxelData: voxelData, lastModified: new Date().toISOString() });
              }
              toast({
                title: 'Success',
                description: "You saved voxel data successfully.",
                status: 'success',
                position: 'top',
                duration: 3000,
                isClosable: true,
              });
              setLoading(false);
            } catch (error) {
              setLoading(false);
            }
          }
        }, 'image/png');
      }
    }
  },
    [gl, user, projectId, projects, setLoading, toast, updateProject, voxels, viewMode]
  );

  const autoSave = useCallback(async () => {
    const current = projects.filter(project => project.id === projectId)[0];
    if (current.status === 'Generating') return;

    if (current?.voxelData.length !== voxels.length) {
      console.log("autoSaved");
      const voxelData = voxels.map(voxel => ({ x: voxel.x, y: voxel.y, z: voxel.z }));
      try {
        const res = await updateVoxel(projectId, voxelData, "Editing", current.prompt);
        updateProject(projectId, { voxelData: voxelData, status: "Editing", lastModified: new Date().toISOString() });
      } catch (error) {
        console.log(error);
      }
    }
  }, [projectId, projects, voxels, updateProject]);

  useEffect(() => {
    document.addEventListener('keyup', save);
    const timer = setInterval(autoSave, 60 * 1000);

    return () => {
      document.removeEventListener('keyup', save);
      clearInterval(timer);
    }
  }, [save, autoSave]);

  return (
    <>
      {viewMode === 'voxel' && <Suspense fallback={<Html center><p className="text-2xl">Loading...</p></Html>}>
        <VoxelView voxels={voxels} />
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