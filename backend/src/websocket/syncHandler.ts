import { Server, Socket } from 'socket.io';

async function emitPeerCount(io: Server, roomName: string): Promise<void> {
  const sockets = await io.in(roomName).fetchSockets();
  io.to(roomName).emit('room-peers', { count: sockets.length });
}

export function registerSyncHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {
    let currentRoom: string | null = null;

    socket.on('join-school', async (data: { schoolId: string } | string) => {
      const schoolId = typeof data === 'string' ? data : data.schoolId;
      const roomName = `school:${schoolId}`;
      await socket.join(roomName);
      currentRoom = roomName;
      void emitPeerCount(io, roomName);
    });

    socket.on('ping', () => {
      socket.emit('pong', { serverTime: Date.now() });
    });

    socket.on('disconnect', () => {
      if (currentRoom) void emitPeerCount(io, currentRoom);
    });
  });
}
