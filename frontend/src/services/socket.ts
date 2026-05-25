import { io, type Socket } from 'socket.io-client';
import { useSyncStore } from '../modules/sync/syncStore';
import { queryClient } from '../app/queryClient';
import { ATTENDANCE_KEYS } from '../modules/attendance/useAttendance';
import { GRADE_KEYS } from '../modules/gradebook/useGradebook';
import { db } from '../db';
import type { LanPeer, UserRole } from '../shared/types';

let socket: Socket | null = null;
let pingInterval: ReturnType<typeof setInterval> | null = null;

export interface JoinPayload {
  schoolId:   string;
  deviceId:   string;
  deviceName: string;
  role:       UserRole;
}

export function getSocket(): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:5000', {
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1_000,
      reconnectionAttempts: Infinity,
    });
  }
  return socket;
}

type SyncRecord = {
  tableName: string;
  operation?: 'create' | 'update' | 'delete';
  payload:   Record<string, unknown>;
};

async function applyIncomingRecord(record: SyncRecord): Promise<void> {
  const { tableName, operation = 'create', payload } = record;

  if (operation === 'delete') {
    const id = payload['id'] as string | undefined;
    if (!id) return;
    if (tableName === 'attendanceRecords') await db.attendanceRecords.delete(id);
    else if (tableName === 'gradeEntries')  await db.gradeEntries.delete(id);
    return;
  }

  if (tableName === 'attendanceRecords') {
    await db.attendanceRecords.put({
      id:          payload['id'] as string ?? String(payload['_id']),
      classLoadId: payload['classLoadId'] as string,
      studentId:   payload['studentId'] as string,
      date:        payload['date'] as string,
      session:     payload['session'] as 'AM' | 'PM',
      status:      payload['status'] as 'present' | 'absent' | 'late' | 'excused',
      syncStatus:  'synced',
      updatedAt:   payload['updatedAt'] as string ?? new Date().toISOString(),
    });
    void queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEYS.all });
  } else if (tableName === 'gradeEntries') {
    await db.gradeEntries.put({
      id:          payload['id'] as string ?? String(payload['_id']),
      classLoadId: payload['classLoadId'] as string,
      studentId:   payload['studentId'] as string,
      quarter:     payload['quarter'] as 'Q1' | 'Q2' | 'Q3' | 'Q4',
      component:   payload['component'] as 'WW' | 'PT' | 'QA',
      columnLabel: payload['columnLabel'] as string,
      score:       payload['score'] as number,
      maxScore:    payload['maxScore'] as number,
      syncStatus:  'synced',
      updatedAt:   payload['updatedAt'] as string ?? new Date().toISOString(),
    });
    void queryClient.invalidateQueries({ queryKey: GRADE_KEYS.all });
  }
}

export function connectSocket(payload: JoinPayload): void {
  const s = getSocket();
  if (!s.connected) s.connect();

  s.emit('join-school', payload);

  s.off('sync-update').on('sync-update', (data: { records: SyncRecord[] }) => {
    for (const record of data.records) {
      void applyIncomingRecord(record);
    }
    useSyncStore.getState().setLastSyncAt(new Date().toISOString());
  });

  s.off('room-peers').on('room-peers', (data: { peers: LanPeer[] }) => {
    // Exclude self from peer list (own deviceId)
    const otherPeers = (data.peers ?? []).filter(p => p.deviceId !== payload.deviceId);
    useSyncStore.getState().setLanPeers(otherPeers);
    if (otherPeers.length > 0) {
      useSyncStore.getState().setConnectionMode('lan');
    } else if (navigator.onLine) {
      useSyncStore.getState().setConnectionMode('cloud');
    }
  });

  s.off('pong').on('pong', () => {
    useSyncStore.getState().setLastPong(Date.now());
  });

  s.off('connect').on('connect', () => {
    useSyncStore.getState().setOnline(true);
    s.emit('join-school', payload);
  });

  s.off('disconnect').on('disconnect', () => {
    useSyncStore.getState().setLanPeers([]);
    if (!navigator.onLine) useSyncStore.getState().setOnline(false);
  });

  if (pingInterval) clearInterval(pingInterval);
  pingInterval = setInterval(() => { s.emit('ping'); }, 30_000);
}

export function disconnectSocket(): void {
  if (pingInterval) { clearInterval(pingInterval); pingInterval = null; }
  useSyncStore.getState().setLanPeers([]);
  socket?.disconnect();
}
