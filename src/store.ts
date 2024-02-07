import { create } from "zustand";
import { Voxel } from "utils/voxel";
import * as THREE from "three";

interface BasicState {
  loading: boolean;
  setLoading: (loading: boolean) => void;

  viewMode: string;
  setViewMode: (viewMode: string) => void;
}

export const useBasicStore = create<BasicState>((set) => ({
  viewMode: 'voxel',
  setViewMode: (viewMode: string) => set({ viewMode }),

  loading: false,
  setLoading: (loading: boolean) => set({ loading }),
}));

interface ThreeState {
  voxels: Voxel[] | null;
  setVoxels: (voxels: Voxel[] | null) => void;
  mesh: THREE.Mesh | null;
  setMesh: (mesh: THREE.Mesh | null) => void;
}

export const useThreeStore = create<ThreeState>((set) => ({
  voxels: null,
  setVoxels: (voxels: Voxel[] | null) => set({ voxels }),
  mesh: null,
  setMesh: (mesh: THREE.Mesh | null) => set({ mesh }),
}));