import { create } from "zustand";
import * as THREE from "three";

interface BasicState {
  loading: boolean;
  setLoading: (loading: boolean) => void;

  viewMode: string;
  setViewMode: (viewMode: string) => void;

  meshReqStatus: 'COMPLETED' | 'FAILED' | 'IN_PROGRESS' | 'IN_QUEUE' | 'RETRIED' | '';
  setMeshReqStatus: (meshReqStatus: 'COMPLETED' | 'FAILED' | 'IN_PROGRESS' | 'IN_QUEUE' | 'RETRIED' | '') => void;

  removeMode: boolean;
  setRemoveMode: (addMode: boolean) => void;
}

export const useBasicStore = create<BasicState>((set) => ({
  viewMode: 'voxel',
  setViewMode: (viewMode: string) => set({ viewMode }),

  loading: false,
  setLoading: (loading: boolean) => set({ loading }),

  meshReqStatus: '',
  setMeshReqStatus: (meshReqStatus: "" | "COMPLETED" | "FAILED" | "IN_PROGRESS" | "IN_QUEUE" | "RETRIED") => set({ meshReqStatus }),

  removeMode: false,
  setRemoveMode: (removeMode: boolean) => set({ removeMode }),
}));

interface ThreeState {
  projectName: string;
  setProjectName: (projectName: string) => void;

  voxels: THREE.Vector3[];
  setVoxels: (voxels: THREE.Vector3[]) => void;
  addVoxel: (voxel: THREE.Vector3) => void;
  removeVoxel: (voxel: THREE.Vector3, voxelSize: number) => void;

  mesh: THREE.BufferGeometry | null;
  setMesh: (mesh: THREE.BufferGeometry | null) => void;
}

export const useThreeStore = create<ThreeState>((set) => ({
  projectName: '',
  setProjectName: (projectName: string) => set({ projectName }),

  voxels: [],
  setVoxels: (voxels: THREE.Vector3[]) => set({ voxels }),
  addVoxel: (voxel: THREE.Vector3) => set((state) => ({ voxels: [...state.voxels, voxel] })),
  removeVoxel: (voxel: THREE.Vector3) => set((state) => ({ voxels: state.voxels.filter((v) => v.x!== voxel.x || v.y!== voxel.y || v.z!== voxel.z )})),

  mesh: null,
  setMesh: (mesh: THREE.BufferGeometry | null) => set({ mesh }),
}));