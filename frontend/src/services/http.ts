import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

let _getToken: () => string | null = () => null;
let _getRefreshToken: () => string | null = () => null;
let _onRefresh: (newToken: string) => void = () => {};
let _onLogout: () => void = () => {};

export function configureHttp(opts: {
  getToken: () => string | null;
  getRefreshToken: () => string | null;
  onRefresh: (newToken: string) => void;
  onLogout: () => void;
}) {
  _getToken = opts.getToken;
  _getRefreshToken = opts.getRefreshToken;
  _onRefresh = opts.onRefresh;
  _onLogout = opts.onLogout;
}

export const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = _getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string> | null = null;

http.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status !== 401 || original._retry) {
      return Promise.reject(err);
    }
    original._retry = true;

    if (!refreshing) {
      refreshing = axios
        .post(`${import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'}/auth/refresh`, {
          refreshToken: _getRefreshToken(),
        })
        .then((r) => {
          const token: string = r.data.data.accessToken;
          _onRefresh(token);
          return token;
        })
        .catch((e) => {
          _onLogout();
          return Promise.reject(e);
        })
        .finally(() => { refreshing = null; });
    }

    const token = await refreshing;
    original.headers.Authorization = `Bearer ${token}`;
    return http(original);
  },
);
