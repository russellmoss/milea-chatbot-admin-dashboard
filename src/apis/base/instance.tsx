import axios from "axios";

let backendUrl = process.env.REACT_APP_API_URL;
console.log('Backend URL:', backendUrl);

export const instance = axios.create({
    baseURL: `${backendUrl}`,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
});

instance.interceptors.response.use((response) => response, (error) => {
  console.error('error', error);
  throw error.response?.data?.detail || error.message || 'Unknown error';
});
