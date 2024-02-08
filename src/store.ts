import { create } from "zustand";
import * as THREE from "three";

interface BasicState {
  loading: boolean;
  setLoading: (loading: boolean) => void;

  viewMode: string;
  setViewMode: (viewMode: string) => void;

  meshReqStatus: 'COMPLETED' | 'FAILED' | 'IN_PROGRESS' | 'IN_QUEUE' | 'RETRIED' | '';
  setMeshReqStatus: (meshReqStatus: 'COMPLETED' | 'FAILED' | 'IN_PROGRESS' | 'IN_QUEUE' | 'RETRIED' | '') => void;
}

export const useBasicStore = create<BasicState>((set) => ({
  viewMode: 'voxel',
  setViewMode: (viewMode: string) => set({ viewMode }),

  loading: false,
  setLoading: (loading: boolean) => set({ loading }),

  meshReqStatus: '',
  setMeshReqStatus: (meshReqStatus: "" | "COMPLETED" | "FAILED" | "IN_PROGRESS" | "IN_QUEUE" | "RETRIED") => set({ meshReqStatus }),
}));

interface ThreeState {
  voxels: THREE.Vector3[] | null;
  setVoxels: (voxels: THREE.Vector3[] | null) => void;
  mesh: THREE.Mesh | null;
  setMesh: (mesh: THREE.Mesh | null) => void;
}

export const useThreeStore = create<ThreeState>((set) => ({
  voxels: null,
  setVoxels: (voxels: THREE.Vector3[] | null) => set({ voxels }),
  mesh: null,
  setMesh: (mesh: THREE.Mesh | null) => set({ mesh }),
}));