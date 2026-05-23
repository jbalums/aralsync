import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

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

export function connectSocket(schoolId: string): void {
  const s = getSocket();
  if (!s.connected) s.connect();
  s.emit('join-school', { schoolId });
}

export function disconnectSocket(): void {
  socket?.disconnect();
}
