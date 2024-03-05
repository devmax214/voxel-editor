export type Voxel = {
  x: number,
  y: number,
  z: number
}

export type Project = {
  id: string;
  name: string;
  progress: number;
  status: "Blank" | "Editing" | "Generating" | "Completed" | "Failed";
  uid: string;
  voxelReqId: string;
  voxelData: Voxel[];
  meshReqId: string;
  meshLink: string;
  imageLink: string;
  lastModified: string;
  prompt: string;
}