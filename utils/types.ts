export const ProjectStatus = {
  Blank: 0,
  VoxelEditing: 1,
  GeometryGenerating: 2,
  GeometryFailed: 3,
  GeometryEditing: 4,
  MaterialGenerating: 5,
  MaterialFailed: 6,
  MaterialCompleted: 7
}

export type Voxel = {
  x: number,
  y: number,
  z: number
}

export type Project = {
  id: string;
  name: string;
  status: typeof ProjectStatus.Blank
        | typeof ProjectStatus.VoxelEditing
        | typeof ProjectStatus.GeometryGenerating
        | typeof ProjectStatus.GeometryFailed
        | typeof ProjectStatus.GeometryEditing
        | typeof ProjectStatus.MaterialGenerating
        | typeof ProjectStatus.MaterialFailed
        | typeof ProjectStatus.MaterialCompleted
  uid: string;
  prompt: string;
  voxelReqId: string;
  meshReqId: string;
  modelReqId: string;
  voxelGenerated: boolean;
  meshGenerated: boolean;
  modelGenerated: boolean;
  lastModified: string;
}