export type Voxel = {
  x: number,
  y: number,
  z: number
}

export type Project = {
  id: string;
  name: string;
  status: "Blank" | "Voxel Editing" | "Geometry Generating" | "Geometry Failed" | "Geometry Editing" | "Material Generating" | "Material Failed" | "Material Completed";
  uid: string;
  prompt: string;
  voxelReqId: string;
  meshReqId: string;
  modelReqId: string;
  meshGenerated: boolean;
  modelGenerated: boolean;
  lastModified: string;
}