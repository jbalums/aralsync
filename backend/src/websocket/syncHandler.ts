import { Server, Socket } from 'socket.io';

interface PeerMeta {
  deviceId:   string;
  deviceName: string;
  role:       string;
  joinedAt:   string;
}

interface SocketData {
  peer?: PeerMeta;
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

    socket.on('join-school', async (data: { schoolId: string; deviceId?: string; deviceName?: string; role?: string } | string) => {
      const schoolId   = typeof data === 'string' ? data : data.schoolId;
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

      void emitPeerList(io, roomName);
    });

    socket.on('ping', () => {
      socket.emit('pong', { serverTime: Date.now() });
    });

    socket.on('disconnect', () => {
      if (currentRoom) void emitPeerList(io, currentRoom);
    });
  });
}
