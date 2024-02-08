import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_AI_BASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_APIKEY;

const apiCall = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${API_KEY}`
  },
  timeout: 240000
});

export async function requestMesh(prompt: string) {
  const requestUrl = `${BASE_URL}/run`;
  try {
    const axiosResponse = await apiCall.post(requestUrl, { 
      input: {
        prompt: prompt
      }
    });
    return axiosResponse.data;
  } catch (error) {
    console.error(`${requestUrl} error: `, error)
    return {};
  }
}

export async function getStatusById(id: string) {
  const requestUrl = `${BASE_URL}/status/${id}`;
  try {
    const axiosResponse = await apiCall.post(requestUrl);
    return axiosResponse.data;
  } catch (error) {
    console.error(`${requestUrl} error: `, error)
    return {};
  }
}

export async function cancelRequestById(id: string) {
  const requestUrl = `${BASE_URL}/cancel/${id}`;
  try {
    const axiosResponse = await apiCall.post(requestUrl);
    return axiosResponse.data;
  } catch (error) {
    console.error(`${requestUrl} error: `, error)
    return {};
  }
}