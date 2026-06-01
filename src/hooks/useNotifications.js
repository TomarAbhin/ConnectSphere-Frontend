import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../api/notificationApi';
import { useNotificationStore } from '../store/notificationStore';
import { useAuth } from './useAuth';

export function useUnreadNotifications() {
  const { user, accessToken, isLoggedIn, hasHydrated } = useAuth();
  const recipientId = user?.userId;
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  const isReady = hasHydrated && isLoggedIn && Boolean(accessToken) && Boolean(recipientId);

  return useQuery({
    queryKey: ['notifications', 'unread', recipientId],
    queryFn: () => notificationApi.unreadCount(recipientId),
    enabled: isReady,
    refetchInterval: 30000,
    onSuccess: (data) => setUnreadCount(data?.count ?? data?.unreadCount ?? 0),
  });
}

export function useNotifications() {
  const { user, accessToken, isLoggedIn, hasHydrated } = useAuth();
  const recipientId = user?.userId;
  const isReady = hasHydrated && isLoggedIn && Boolean(accessToken) && Boolean(recipientId);
  return useQuery({
    queryKey: ['notifications', recipientId],
    queryFn: () => notificationApi.getByRecipient(recipientId),
    enabled: isReady,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
