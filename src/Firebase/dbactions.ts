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
  getDownloadURL
} from "firebase/storage";
import { app } from "./config";
import { Voxel } from "utils/types";

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

export const createProject = async (uid: string) => {
  try {
    const project = {
      name: "undefined",
      uid: uid,
      status: "Blank",
      progress: 0,
      voxelReqId: "",
      voxelData: [],
      imageLink: "",
      meshReqId: "",
      meshLink: "",
      objUrl: "",
      mtlUrl: "",
      albedoUrl: "",
      metallicUrl: "",
      roughnessUrl: "",
      lastModified: new Date().toISOString(),
      prompt: ""
    };
    const projectsRef = collection(db, 'projects');
    const projectRef = await addDoc(projectsRef, project);
    return {projectId: projectRef.id};
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
  file: string,
  prompt: string
) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userData = (await getDoc(userRef)).data();
    await updateDoc(userRef, {
      'billing.compute_unit': userData?.billing.compute_unit - usedPrice
    });
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      imageLink: file,
      status: "Editing",
      voxelData: voxelData,
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
  file: string,
  status: string,
  prompt: string
) => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      status: status,
      voxelData: voxelData,
      imageLink: file,
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

export const checkStatus = async (projectId: string) => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    const projectData = (await getDoc(projectRef)).data();
    return {
      status: projectData?.status,
      progress: projectData?.progress,
      meshLink: projectData?.meshLink
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

export const update3DUrls = async (projectId: string) => {
  const storage = getStorage();
  const objUrl = await getDownloadURL(ref(storage, `${projectId}/model.obj`));
  const mtlUrl = await getDownloadURL(ref(storage, `${projectId}/model.mtl`));
  const albedoUrl = await getDownloadURL(ref(storage, `${projectId}/texture_kd.jpg`));
  const metallicUrl = await getDownloadURL(ref(storage, `${projectId}/texture_metallic.jpg`));
  const roughnessUrl = await getDownloadURL(ref(storage, `${projectId}/texture_roughness.jpg`));
  const meshLink = await getDownloadURL(ref(storage, `${projectId}/mesh.png`));

  const projectRef = doc(db, 'projects', projectId);
  await updateDoc(projectRef, {
    objUrl,
    mtlUrl,
    albedoUrl,
    metallicUrl,
    roughnessUrl,
    meshLink
  });

  return {
    objUrl,
    mtlUrl,
    albedoUrl,
    metallicUrl,
    roughnessUrl,
    // meshLink
  };
}

export const getCompletedProjects = async () => {
  try {
    const q = query(collection(db, "projects"), where("status", "==", "Completed"));
    
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