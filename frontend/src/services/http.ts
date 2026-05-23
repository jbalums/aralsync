import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

// Callbacks injected at app startup to avoid circular imports
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
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = _getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Single in-flight refresh promise shared across concurrent 401s
let refreshing: Promise<string> | null = null;

http.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (err.response?.status !== 401 || original._retry) {
      return Promise.reject(err as Error);
    }
    original._retry = true;

    if (!refreshing) {
      const rt = _getRefreshToken();
      if (!rt) {
        _onLogout();
        return Promise.reject(err as Error);
      }
      refreshing = axios
        .post<{ data: { accessToken: string } }>(
          `${import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1'}/auth/refresh`,
          { refreshToken: rt },
        )
        .then((r) => {
          const token = r.data.data.accessToken;
          _onRefresh(token);
          return token;
        })
        .catch((e) => {
          _onLogout();
          return Promise.reject(e as Error);
        })
        .finally(() => { refreshing = null; });
    }

    const token = await refreshing;
    original.headers.Authorization = `Bearer ${token}`;
    return http(original);
  },
);
