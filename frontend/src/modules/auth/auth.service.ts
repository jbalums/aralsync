import { http } from '../../services/http';
import type { Device, User } from '../../shared/types';

export interface LoginPayload {
  email: string;
  password: string;
  deviceId: string;
  deviceName?: string;
  userAgent?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  schoolId: string;
  deviceId: string;
  deviceName?: string;
  userAgent?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await http.post<{ data: AuthResponse }>('/auth/login', payload);
    return res.data.data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await http.post<{ data: AuthResponse }>('/auth/register', payload);
    return res.data.data;
  },

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const res = await http.post<{ data: AuthTokens }>('/auth/refresh', { refreshToken });
    return res.data.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await http.post('/auth/logout', { refreshToken }).catch(() => {});
  },

  async me(): Promise<User> {
    const res = await http.get<{ data: User }>('/auth/me');
    return res.data.data;
  },

  async updateProfile(data: {
    name?: string;
    employeeNumber?: string;
    position?: string;
    avatarUrl?: string;
  }): Promise<User> {
    const res = await http.patch<{ data: User }>('/auth/me', data);
    return res.data.data;
  },

  async listDevices(): Promise<Device[]> {
    const res = await http.get<{ data: Device[] }>('/auth/devices');
    return res.data.data;
  },

  async renameDevice(deviceId: string, name: string): Promise<Device> {
    const res = await http.patch<{ data: Device }>(`/auth/devices/${encodeURIComponent(deviceId)}`, { name });
    return res.data.data;
  },

  async revokeDevice(deviceId: string): Promise<{ revokedSelf: boolean }> {
    const res = await http.delete<{ data: { revokedSelf: boolean } }>(
      `/auth/devices/${encodeURIComponent(deviceId)}`,
    );
    return res.data.data;
  },
};
