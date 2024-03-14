import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader";
import useMaterial from "@/hooks/useMaterial";
import { useProjectContext } from "@/contexts/projectContext";
import { useThreeStore } from "@/store";
import { cropToSquare } from "utils/utils";
import { saveMeshIcon } from "@/Firebase/dbactions";

const MeshView = ({
  projectId
} : {
  projectId: string
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { mesh, setMesh, setVoxels } = useThreeStore();
  const material = useMaterial();
  const { projects } = useProjectContext();
  const { gl } = useThree();
  const current = projects.find((project) => project.id === projectId);

  const baseURL = `${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/getAsset?projectId=${projectId}&fileName=`;

  const getMeshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = (await axios.get(`${baseURL}mesh.ply`, {responseType: 'arraybuffer'})).data;
      const loader = new PLYLoader();
      const geometry = loader.parse(res);
      geometry.computeVertexNormals();
      setMesh(geometry);
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  }, [baseURL, setMesh]);

  useEffect(() => {
    if (current?.meshGenerated)
      getMeshData();
    setVoxels([]);
  }, [current, getMeshData, setVoxels]);

  const save = useCallback(async (e: KeyboardEvent) => {
    if (e.code === "F9") {
      e.preventDefault();
      if (mesh) {
        gl.domElement.toBlob(async (blob) => {
          if (blob) {
            console.log("capture mesh to png");
            try {
              const croppedBlob = await cropToSquare(blob);
              await saveMeshIcon(projectId, croppedBlob);
            } catch (error) {
              console.log(error);
            }
          }
        }, 'image/png');
      }
    }
  }, [mesh, projectId, gl]);

  useEffect(() => {
    document.addEventListener('keyup', save);

    return () => {
      document.removeEventListener('keyup', save);
    }
  }, [save]);
  
  return (
    <group>
      {isLoading && <Html center><p className="text-2xl">Loading...</p></Html>}
      {mesh && <mesh
        rotation={[Math.PI * 3 / 2, 0, 0]}
        geometry={mesh}
        material={material}
      />}
    </group>
  )
}

export default MeshView;