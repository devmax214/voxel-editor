import { create } from "zustand";
import * as THREE from "three";
import type { Project } from "utils/types";

interface BasicState {
  loading: boolean;
  setLoading: (loading: boolean) => void;

  viewMode: string;
  setViewMode: (viewMode: string) => void;

  meshReqStatus: 'COMPLETED' | 'FAILED' | 'IN_PROGRESS' | 'IN_QUEUE' | 'RETRIED' | '';
  setMeshReqStatus: (meshReqStatus: 'COMPLETED' | 'FAILED' | 'IN_PROGRESS' | 'IN_QUEUE' | 'RETRIED' | '') => void;

  removeMode: boolean;
  setRemoveMode: (removeMode: boolean) => void;

  useNormalMap: boolean;
  setUseNormalMap: (useNormalMap: boolean) => void;
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

  useNormalMap: false,
  setUseNormalMap: (useNormalMap: boolean) => set({ useNormalMap }),
}));

interface ThreeState {
  voxels: THREE.Vector3[];
  setVoxels: (voxels: THREE.Vector3[]) => void;
  addVoxel: (voxel: THREE.Vector3) => void;
  removeVoxel: (voxel: THREE.Vector3) => void;

  mesh: THREE.BufferGeometry | null;
  setMesh: (mesh: THREE.BufferGeometry | null) => void;
}

export const useThreeStore = create<ThreeState>((set) => ({

  voxels: [],
  setVoxels: (voxels: THREE.Vector3[]) => set({ voxels }),
  addVoxel: (voxel: THREE.Vector3) => set((state) => ({ voxels: [...state.voxels, voxel] })),
  removeVoxel: (voxel: THREE.Vector3) => set((state) => ({ voxels: state.voxels.filter((v) => v.x!== voxel.x || v.y!== voxel.y || v.z!== voxel.z )})),

  mesh: null,
  setMesh: (mesh: THREE.BufferGeometry | null) => set({ mesh }),
}));

interface PopularState {
  populars: Project[];
  setPopulars: (populars: Project[]) => void;
}

export const useCompletedProjects = create<PopularState>((set) => ({
  populars: [],
  setPopulars: (populars: Project[]) => set({ populars }),
}));