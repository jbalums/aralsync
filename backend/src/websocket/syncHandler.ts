import { Server, Socket } from 'socket.io';
import { authService } from '../modules/auth/auth.service';

interface PeerMeta {
  deviceId:   string;
  deviceName: string;
  role:       string;
  joinedAt:   string;
}

interface SocketData {
  peer?: PeerMeta;
  userId?: string;
}

const TOUCH_THROTTLE_MS = 30_000;
const lastTouched = new Map<string, number>();

function touchKey(userId: string, deviceId: string): string {
  return `${userId}::${deviceId}`;
}

function maybeTouchDevice(userId: string | undefined, deviceId: string | undefined): void {
  if (!userId || !deviceId) return;
  const key = touchKey(userId, deviceId);
  const now = Date.now();
  const prev = lastTouched.get(key) ?? 0;
  if (now - prev < TOUCH_THROTTLE_MS) return;
  lastTouched.set(key, now);
  void authService.touchDevice(userId, deviceId);
}

async function emitPeerList(io: Server, roomName: string): Promise<void> {
  const sockets = await io.in(roomName).fetchSockets();
  const peers: PeerMeta[] = sockets
    .map((s) => (s.data as SocketData).peer)
    .filter((p): p is PeerMeta => Boolean(p));
  io.to(roomName).emit('room-peers', { peers });
}

export function registerSyncHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {
    let currentRoom: string | null = null;

    socket.on(
      'join-school',
      async (
        data:
          | { schoolId: string; userId?: string; deviceId?: string; deviceName?: string; role?: string }
          | string,
      ) => {
        const schoolId   = typeof data === 'string' ? data : data.schoolId;
        const userId     = typeof data === 'string' ? undefined : data.userId;
        const deviceId   = typeof data === 'string' ? socket.id : (data.deviceId   ?? socket.id);
        const deviceName = typeof data === 'string' ? 'Unknown device' : (data.deviceName ?? 'Unknown device');
        const role       = typeof data === 'string' ? 'subject_teacher' : (data.role     ?? 'subject_teacher');

        const roomName = `school:${schoolId}`;
        await socket.join(roomName);
        currentRoom = roomName;

        (socket.data as SocketData).peer = {
          deviceId,
          deviceName,
          role,
          joinedAt: new Date().toISOString(),
        };
        (socket.data as SocketData).userId = userId;

        maybeTouchDevice(userId, deviceId);
        void emitPeerList(io, roomName);
      },
    );

    socket.on('ping', () => {
      const data = socket.data as SocketData;
      maybeTouchDevice(data.userId, data.peer?.deviceId);
      socket.emit('pong', { serverTime: Date.now() });
    });

    socket.on('disconnect', () => {
      if (currentRoom) void emitPeerList(io, currentRoom);
    });
  });
}
