import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../api/notificationApi';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';

export function useUnreadNotifications() {
  const recipientId = useAuthStore((state) => state.user?.userId);
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);

  return useQuery({
    queryKey: ['notifications', 'unread', recipientId],
    queryFn: () => notificationApi.unreadCount(recipientId),
    enabled: Boolean(recipientId),
    refetchInterval: 30000,
    onSuccess: (data) => setUnreadCount(data?.count ?? data?.unreadCount ?? 0),
  });
}

export function useNotifications() {
  const recipientId = useAuthStore((state) => state.user?.userId);
  return useQuery({
    queryKey: ['notifications', recipientId],
    queryFn: () => notificationApi.getByRecipient(recipientId),
    enabled: Boolean(recipientId),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
