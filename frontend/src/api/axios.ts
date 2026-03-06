import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // This sends the JWT cookie automatically
})

export default api;