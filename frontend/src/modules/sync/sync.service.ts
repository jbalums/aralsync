import { http } from '../../services/http';

export interface SyncStatus {
  lastSyncAt: string | null;
}

export interface SyncLogEntry {
  id:          string;
  type:        'push' | 'pull';
  recordCount: number;
  status:      'success' | 'failed';
  error?:      string;
  createdAt:   string;
}

export const syncApiService = {
  async getStatus(): Promise<SyncStatus> {
    const res = await http.get<{ data: SyncStatus }>('/sync/status');
    return res.data.data;
  },

  async getLogs(): Promise<SyncLogEntry[]> {
    const res = await http.get<{ data: SyncLogEntry[] }>('/sync/logs');
    return res.data.data;
  },
};
