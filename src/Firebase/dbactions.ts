import {
  getFirestore,
  collection,
  query,
  limit,
  where,
  getDocs,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  orderBy, 
  deleteField

} from "firebase/firestore";
import { app } from "./config";
import { Voxel } from "utils/types";
import { ref, getDownloadURL, uploadBytes, deleteObject } from 'firebase/storage';
import { storage } from "./config";


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
      voxelDataLink: "", //changed []
      imageLink: "",
      meshReqId: "",
      meshLink: "",
      lastModified: new Date().toISOString(),
      prompt: "",
      meshGenerated: false
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
    const projectData = await getDoc(projectRef);
    // Delete associated voxel data file
    if (projectData.exists() && projectData.data()?.voxelDataLink) {
      const storageRef = ref(storage, projectData.data().voxelDataLink);
      await deleteObject(storageRef).then(() => {
        console.log("removed storage file for voxel data");
      }).catch((error) => {
        // Uh-oh, an error occurred!
      });
    }
    await deleteDoc(projectRef);
    
    return { message: 'Project removed successfully' };
  } catch (error) {
    console.log(error);
    return error;
  }
}
export const SaveVoxelData = async (projectId: string, voxelData: Voxel[]) => {
  console.log(voxelData);
  const jsonData = JSON.stringify(voxelData);
  const storageRef = ref (storage, `voxelData/${projectId}.json`)
  const blob = new Blob([jsonData], { type: "application/json" });
  uploadBytes(storageRef, blob).then((snapshot) => {
    console.log('Uploaded a voxel');
  });
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
    console.log("voxelCreate");
    SaveVoxelData(projectId, voxelData);
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      imageLink: file,
      status: "Editing",
      voxelDataLink:  `voxelData/${projectId}.json`,
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
  status: string,
  prompt: string
) => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    SaveVoxelData(projectId, voxelData);
    await updateDoc(projectRef, {
      status: status,
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
    const q = query(collection(db, "projects"), where("status", "==", "Completed"), orderBy("lastModified", "desc"), limit(24));
    
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