import { Server, Socket } from 'socket.io';

export function registerSyncHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {
    socket.on('join-school', (schoolId: string) => {
      void socket.join(`school:${schoolId}`);
    });

    socket.on('sync-push', (_payload: unknown) => {
      // Full implementation in sync module (Step 12)
      // Broadcasts update to school room after processing
    });

    socket.on('sync-pull', (_payload: unknown) => {
      // Full implementation in sync module (Step 12)
    });

    socket.on('ping', () => {
      socket.emit('pong', { serverTime: Date.now() });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}
