import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from './auth.service';

export const DEVICE_KEYS = {
  list: ['devices'] as const,
};

export function useDevices() {
  return useQuery({
    queryKey: DEVICE_KEYS.list,
    queryFn:  () => authService.listDevices(),
    staleTime: 30_000,
  });
}

export function useRenameDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ deviceId, name }: { deviceId: string; name: string }) =>
      authService.renameDevice(deviceId, name),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: DEVICE_KEYS.list });
    },
  });
}

export function useRevokeDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (deviceId: string) => authService.revokeDevice(deviceId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: DEVICE_KEYS.list });
    },
  });
}
