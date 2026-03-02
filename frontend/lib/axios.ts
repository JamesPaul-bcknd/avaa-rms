import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8001/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    // Don't overwrite if Authorization was already set (e.g. admin requests)
    if (!config.headers.Authorization) {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default api;
