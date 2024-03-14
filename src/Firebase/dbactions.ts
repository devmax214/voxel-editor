import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  orderBy
} from "firebase/firestore";
import {
  ref,
  getStorage,
  uploadBytes,
  uploadString
} from "firebase/storage";
import { app } from "./config";
import { Voxel, ProjectStatus } from "utils/types";

const db = getFirestore(app);

export const getUserInfo = async (uid: string) => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data();
    return data;
  } catch (error) {
    console.log(error);
    return error;
  }
}

export const getProjectsByUid = async (uid: string) => {
  try {
    const q = query(collection(db, "projects"), where("uid", "==", uid), orderBy("lastModified", "desc"), orderBy("name"));
    
    const querySnapshot = await getDocs(q);
    let response:any = [];
    querySnapshot.forEach((doc) => {
      response.push({...doc.data(), id: doc.id});
    });
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
}

export const createNewProject = async (uid: string) => {
  try {
    const project = {
      name: 'undefined',
      status: ProjectStatus.Blank,
      uid: uid,
      prompt: "",
      voxelReqId: '',
      meshReqId: '',
      modelReqId: '',
      voxelGenerated: false,
      meshGenerated: false,
      modelGenerated: false,
      lastModified: new Date().toISOString(),
    };
    const projectsRef = collection(db, 'projects');
    const projectRef = await addDoc(projectsRef, project);
    return {id: projectRef.id, ...project};
  } catch (error) {
    console.log(error);
    return error;
  }
}

export const changeProjectName = async (projectId: string, newProjectName: string) => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      name: newProjectName,
      lastModified: new Date().toISOString()
    });
    return {name: newProjectName};
  } catch (error) {
    console.log(error);
    return error;
  }
}

export const duplicateProject = async (projectId: string) => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    const projectData = (await getDoc(projectRef)).data();

    const newProjectRef = await addDoc(collection(db, 'projects'), projectData);
    return {projectId: newProjectRef.id};
  } catch (error) {
    console.log(error);
    return error;
  }
}

export const removeProject = async (projectId: string) => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    await deleteDoc(projectRef);
    
    return { message: 'Project removed successfully' };
  } catch (error) {
    console.log(error);
    return error;
  }
}

export const voxelCreated = async (
  uid: string,
  projectId: string,
  usedPrice: number,
  voxelData: Voxel[],
  iconData: Blob,
  prompt: string
) => {
  try {
    const storage = getStorage();
    const iconRef = ref(storage, `${projectId}/voxel.png`);
    await uploadBytes(iconRef, iconData);
    const voxelRef = ref(storage, `${projectId}/voxel.json`);
    await uploadString(voxelRef, JSON.stringify(voxelData));
    const userRef = doc(db, 'users', uid);
    const userData = (await getDoc(userRef)).data();

    await updateDoc(userRef, {
      'billing.compute_unit': userData?.billing.compute_unit - usedPrice
    });
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      voxelGenerated: true,
      status: ProjectStatus.VoxelEditing,
      lastModified: new Date().toISOString(),
      prompt: prompt
    });
    const projectData = (await getDoc(projectRef)).data();
    return {
      message: "Successfully saved Voxel Data",
      project: projectData
    }
  } catch (error) {
    console.log(error);
    return error;
  }
}

export const updateVoxel = async (
  projectId: string,
  voxelData: Voxel[],
  prompt: string
) => {
  try {
    const storage = getStorage();
    const voxelRef = ref(storage, `${projectId}/voxel.json`);
    await uploadString(voxelRef, JSON.stringify(voxelData));

    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      status: ProjectStatus.VoxelEditing,
      lastModified: new Date().toISOString(),
      prompt: prompt
    });
    const projectData = (await getDoc(projectRef)).data();
    return {
      message: "Successfully saved Voxel Data",
      project: projectData
    }
  } catch (error) {
    console.log(error);
    return error;
  }
}

export const updateMesh = async (
  projectId: string,
  plyFile: File,
) => {
  try {
    const storage = getStorage();
    const meshRef = ref(storage, `${projectId}/mesh.ply`);
    await uploadBytes(meshRef, plyFile);

    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      meshGenerated: true,
      status: ProjectStatus.GeometryEditing,
      lastModified: new Date().toISOString(),
    });
  } catch (error) {
    console.log(error);
  }
}

export const saveMeshIcon = async (
  projectId: string,
  iconData: Blob,
) => {
  try {
    const storage = getStorage();
    const iconRef = ref(storage, `${projectId}/mesh.png`);
    await uploadBytes(iconRef, iconData);
  } catch (error) {
    console.log(error);
    return error;
  }
}

export const checkStatus = async (projectId: string) => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    const projectData = (await getDoc(projectRef)).data();
    return {
      id: projectRef.id,
      ...projectData
    }
  } catch (error) {
    console.log(error);
    return error;
  }
}

export const saveVoxelReqId = async (projectId: string, voxelReqId: string) => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      voxelReqId: voxelReqId
    });
    return {
      message: "Successfully saved Voxel Request Id"
    }
  } catch (error) {
    console.log(error);
    return error;
  }
}

export const getCompletedProjects = async () => {
  try {
    const q = query(collection(db, "projects"), where("status", "==", ProjectStatus.MaterialCompleted), orderBy("lastModified", "desc"));
    
    const querySnapshot = await getDocs(q);
    let response:any = [];
    querySnapshot.forEach((doc) => {
      response.push({...doc.data(), id: doc.id});
    });
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
}