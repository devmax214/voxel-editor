import axios from 'axios';
import { Voxel } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_BASE_URL

export async function getUserInfo(uid: string) {
  const requestUrl = encodeURI(BASE_URL + '/getUserInfo');
  try {
    const axiosResponse = await axios.get(requestUrl, {
      params: { uid: uid }
    });
    return axiosResponse.data;
  } catch (error) {
    console.error(`${requestUrl} error: `, error)
    return {};
  }
}

export async function getProjectsByUid(uid: string) {
  const requestUrl = encodeURI(BASE_URL + '/getProjectsByUid');
  try {
    const axiosResponse = await axios.get(requestUrl, {
      params: { uid: uid }
    });
    return axiosResponse.data;
  } catch (error) {
    console.error(`${requestUrl} error: `, error)
    return {};
  }
}

export async function createProject(uid: string) {
  const requestUrl = encodeURI(BASE_URL + '/createProject');
  try {
    const axiosResponse = await axios.get(requestUrl, {
      params: { uid: uid }
    });
    return axiosResponse.data;
  } catch (error) {
    console.error(`${requestUrl} error: `, error)
    return {};
  }
}

export async function creditExist(uid: string) {
  const requestUrl = encodeURI(BASE_URL + '/creditExist');
  try {
    const axiosResponse = await axios.get(requestUrl, {
      params: { uid: uid }
    });
    return axiosResponse.data;
  } catch (error) {
    console.error(`${requestUrl} error: `, error)
    return {};
  }
}

export async function voxelCreated(uid: string, projectId: string, usedPrice: number, voxelData: Voxel[], file: string) {
  const requestUrl = encodeURI(BASE_URL + '/voxelCreated');
  try {
    const axiosResponse = await axios.post(requestUrl, { uid, projectId, usedPrice, voxelData, file });
    return axiosResponse.data;
  } catch (error) {
    console.error(`${requestUrl} error: `, error)
    return {};
  }
}

export async function startStage2(projectId: string, prompt: string) {
  const requestUrl = encodeURI(BASE_URL + '/startStage2');
  try {
    const axiosResponse = await axios.post(requestUrl, { projectId, prompt });
    return axiosResponse;
  } catch (error) {
    console.error(`${requestUrl} error: `, error)
    return {};
  }
}

export async function updateVoxel(projectId: string, voxelData: Voxel[], file: string) {
  const requestUrl = encodeURI(BASE_URL + '/updateVoxel');
  try {
    const axiosResponse = await axios.post(requestUrl, { projectId, voxelData, file });
    return axiosResponse.data;
  } catch (error) {
    console.error(`${requestUrl} error: `, error)
    return {};
  }
}

export async function checkStatus(projectId: string) {
  const requestUrl = encodeURI(BASE_URL + '/checkStatus');
  try {
    const axiosResponse = await axios.get(requestUrl, {
      params: { projectId: projectId }
    });
    return axiosResponse.data;
  } catch (error) {
    console.error(`${requestUrl} error: `, error)
    return {};
  }
}

export async function changeProjectName(projectId: string, newProjectName: string) {
  const requestUrl = encodeURI(BASE_URL + '/changeProjectName');
  try {
    const axiosResponse = await axios.get(requestUrl, {
      params: { projectId, newProjectName }
    });
    return axiosResponse.data;
  } catch (error) {
    console.error(`${requestUrl} error: `, error)
    return {};
  }
}

export async function duplicateProject(projectId: string) {
  const requestUrl = encodeURI(BASE_URL + '/duplicateProject');
  try {
    const axiosResponse = await axios.get(requestUrl, {
      params: { projectId: projectId }
    });
    return axiosResponse.data;
  } catch (error) {
    console.error(`${requestUrl} error: `, error)
    return {};
  }
}

export async function removeProject(projectId: string) {
  const requestUrl = encodeURI(BASE_URL + '/removeProject');
  try {
    const axiosResponse = await axios.get(requestUrl, {
      params: { projectId: projectId }
    });
    return axiosResponse.data;
  } catch (error) {
    console.error(`${requestUrl} error: `, error)
    return {};
  }
}