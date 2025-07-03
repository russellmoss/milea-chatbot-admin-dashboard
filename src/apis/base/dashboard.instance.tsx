import swal from 'sweetalert';
import axios from 'axios';

const baseURL = `${process.env.REACT_APP_DASHBOARD_BACKEND}`;

export const instance = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('milea_admin_dashboard_accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use((response) => response, (error) => {
  swal({
    title: '',
    text: error.response?.data.detail,
    icon: 'error'
  });
  throw error.response?.data.detail;
});