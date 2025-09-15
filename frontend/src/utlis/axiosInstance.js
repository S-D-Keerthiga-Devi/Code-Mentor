import axios from "axios"

const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true
})

instance.interceptors.response.use((config) => {
    const token = localStorage.getItem("token")
    if (token) config.headers.Authorization = `Bearer ${token}`;

    return config
}, (error) => {
    return Promise.reject(error);
});
  
export default instance