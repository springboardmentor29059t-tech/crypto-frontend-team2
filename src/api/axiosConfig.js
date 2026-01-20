import axios from 'axios';

const api = axios.create({
  /**
   * 🛠️ PROXY SYNC
   * baseURL is /api. This must match the context-path in Spring Boot
   * and the proxy prefix in vite.config.js.
   */
  baseURL: '/api',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// --- REQUEST INTERCEPTOR ---
api.interceptors.request.use(
  (config) => {
    // 🛡️ Ensure URL is clean. Axios will join baseURL ('/api') + config.url ('/portfolio/holdings')
    // Resulting in '/api/portfolio/holdings'

    const token = localStorage.getItem('token');

    if (token && token !== 'undefined' && token !== 'null') {
      const cleanToken = token.replace(/["]+/g, '').trim();
      if (cleanToken.length > 20) {
        config.headers.Authorization = `Bearer ${cleanToken}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// --- RESPONSE INTERCEPTOR ---
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Handle Network Error / Server Offline
    if (!error.response) {
      if (error.code !== 'ERR_CANCELED') {
        console.error("📡 Sentinel Node Offline. Check Spring Boot on :8080");
      }
      return Promise.reject({
        ...error,
        message: "Network Error: Database execution node unreachable.",
        isNetworkError: true
      });
    }

    const status = error.response.status;

    // 2. Handle 401 Unauthorized (Handshake Failure)
    if (status === 401 && !originalRequest._retry) {

      if (originalRequest.url.includes('user/me')) {
        return Promise.resolve({ data: null });
      }

      // ✅ Path Update: Added /holdings and /transactions to public check bypass
      const publicPaths = ['user/login', 'user/register', 'market-data'];
      const isPublic = publicPaths.some(path => originalRequest.url.includes(path));

      if (isPublic) return Promise.reject(error);

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      console.warn("🔐 Handshake Revoked: Session Expired.");

      localStorage.removeItem('token');
      processQueue(error, null);
      isRefreshing = false;

      if (!['/login', '/register'].includes(window.location.pathname)) {
        window.location.replace('/login?expired=true');
      }

      return Promise.reject(error);
    }

    // 3. Handle 403 Forbidden (Identity Mismatch)
    if (status === 403) {
      console.error("🚫 Access Forbidden: Invalid Identity Token or Path Conflict.");
      // Clear token if the backend explicitly mentions JWT failure
      if (error.response.data?.message?.toLowerCase().includes("jwt")) {
          localStorage.removeItem('token');
          window.location.replace('/login');
      }
    }

    // 4. Handle 405 Method Not Allowed (The Critical Handshake Fix)
    if (status === 405) {
      console.error(`❌ 405 Method Not Allowed: The endpoint ${originalRequest.url} does not support this HTTP method.`);
      console.info("Verify that your api.post() matches @PostMapping and api.get() matches @GetMapping.");
    }

    return Promise.reject(error);
  }
);

export default api;