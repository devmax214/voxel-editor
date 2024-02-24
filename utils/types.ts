export type Voxel = {
  x: number,
  y: number,
  z: number
}

export type Project = {
  id: string;
  name: string;
  progress: number;
  status: "Blank" | "Editing" | "Generating" | "Completed";
  uid: string;
  voxelData: Voxel[];
  meshLink: string;
  imageLink: string;
}