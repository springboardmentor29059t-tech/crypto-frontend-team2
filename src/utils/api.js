import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Token expired or unauthorized
            localStorage.removeItem('token');
            if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
                // window.location.href = '/login';
                alert(`Authentication Error: ${error.response.status}. Please try logging out and logging in again.`);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
