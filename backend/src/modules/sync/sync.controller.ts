import type { Request, Response, NextFunction } from 'express';
import type { Server } from 'socket.io';
import { syncService } from './sync.service';
import { success } from '../../shared/utils/response';

export const syncController = {
  async push(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { records } = req.body as { records: Parameters<typeof syncService.push>[0] };
      const { userId, schoolId } = req.user!;
      const result = await syncService.push(records, userId, schoolId);

      // Broadcast to school room so LAN peers pick up the changes
      const io = req.app.locals['io'] as Server | undefined;
      if (io) {
        io.to(`school:${schoolId}`).emit('sync-update', { records, pushedBy: userId });
      }

      success(res, result);
    } catch (err) { next(err); }
  },

  async pull(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { lastSyncAt } = req.body as { lastSyncAt?: string };
      const { userId, schoolId } = req.user!;
      const result = await syncService.pull(userId, schoolId, lastSyncAt);
      success(res, result);
    } catch (err) { next(err); }
  },

  async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = await syncService.getStatus(req.user!.userId);
      success(res, status);
    } catch (err) { next(err); }
  },

  async getLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await syncService.getLogs(req.user!.userId);
      success(res, logs);
    } catch (err) { next(err); }
  },
};
